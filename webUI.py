import os
import pathlib
import shutil
import socket
import subprocess
import uuid

from flask import Flask, render_template, session, request, send_file, Response

app = Flask(__name__)
app.secret_key = 'web-poST Simulator'.encode()


def copytree(src, dst, symlinks=False, ignore=None):
    if not os.path.exists(dst):
        os.mkdir(dst)
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            if not os.path.exists(d):
                shutil.copytree(s, d, symlinks, ignore)
        else:
            if not os.path.exists(d):
                shutil.copyfile(s, d)


def read_from_file(file):
    file = open(file, "r")
    text = file.read()
    file.close()
    return text


def save_code(path, code):
    os.makedirs(path, exist_ok=True)
    if os.path.exists(path + "poST_code.py"):
        subprocess.run(["rm", path + "poST_code.py"])
        subprocess.run(["rm", path + "out"])
    subprocess.run(["touch", path + "out"])
    with open(path + "code.post", "w") as f:
        f.write("\n".join(code.splitlines()))
        f.close()


def render_index(poST_code, Py_code, out, path, sim, pause):
    if sim:
        return render_template("index.html", poST_code=poST_code, Py_code=Py_code, out=out, path=path + "outputs",
                               inputs=path + "inputs",
                               disable_start="disabled", sim=str(sim).lower(),
                               Pause="Pause simulation" if not pause else "Unpause simulation")
    if Py_code is not None:
        return render_template("index.html", poST_code=poST_code, Py_code=Py_code, out=out, path=path + "outputs",
                               inputs=path + "inputs",
                               disable_inputs="disabled", disable_stop="disabled", disable_pause="disabled",
                               sim=str(sim).lower(), Pause="Pause simulation" if not pause else "Unpause simulation")
    if out is not None:
        return render_template("index.html", poST_code=poST_code, out=out, path=path + "outputs",
                               inputs=path + "inputs",
                               disable_pause="disabled", disable_Py="disabled", disable_inputs="disabled",
                               disable_start="disabled", disable_stop="disabled", sim=str(sim).lower(),
                               Pause="Pause simulation" if not pause else "Unpause simulation")
    if poST_code is not None:
        return render_template("index.html", poST_code=poST_code, path=path + "outputs", inputs=path + "inputs",
                               disable_Py="disabled", disable_pause="disabled", disable_inputs="disabled",
                               disable_start="disabled", disable_stop="disabled", sim=str(sim).lower(),
                               Pause="Pause simulation" if not pause else "Unpause simulation")

    return render_template("index.html", path=path + "outputs", inputs=path + "inputs",
                           disable_poST="disabled", disable_Py="disabled", disable_pause="disabled",
                           disable_inputs="disabled", disable_start="disabled", disable_stop="disabled",
                           sim=str(sim).lower(), Pause="Pause simulation" if not pause else "Unpause simulation")


def startSim(user_path):
    copytree("./sim", "./"+user_path+"sim")
    shutil.copyfile(user_path + "poST_code.py", user_path+"sim/poST_code.py")
    poST_code = request.form["poST_code"]
    Py_code = None
    if os.path.exists(user_path + "poST_code.py"):
        Py_code = read_from_file(user_path + "poST_code.py")
    out = read_from_file(user_path + "out")
    open(user_path + "output_outputs", 'w').close()
    open(user_path + "inputs", 'w').close()
    open(user_path + "flags", 'w').close()
    sim = True
    pause = False
    with open(user_path + 'flags', "w") as f:
        f.write(sim.__str__() + "\n" + pause.__str__() + "\n")
        f.close()
    print(user_path)
    subprocess.Popen(["./startSim.sh", user_path])
    return render_index(poST_code, Py_code, out, user_path, sim, pause)


def stopSim(user_path):
    poST_code = request.form["poST_code"]
    Py_code = None
    out = None
    if os.path.exists(user_path + "poST_code.py"):
        Py_code = read_from_file(user_path + "poST_code.py")
    if os.path.exists(user_path + "out"):
        out = read_from_file(user_path + "out")
    sim = False
    pause = False
    with open(user_path + 'flags', "w") as f:
        f.write(sim.__str__() + "\n" + pause.__str__() + "\n")
        f.close()
    open(user_path + "output_outputs", 'w').close()
    open(user_path + "inputs", 'w').close()
    open(user_path + "flags", 'w').close()
    return render_index(poST_code, Py_code, out, user_path, sim, pause)


def pauseSim(user_path):
    poST_code = request.form["poST_code"]
    Py_code = None
    if os.path.exists(user_path + "poST_code.py"):
        Py_code = read_from_file(user_path + "poST_code.py")
    out = read_from_file(user_path + "out")
    sim = True
    with open(user_path + 'flags', "r") as f:
        strs = f.read().splitlines()
        f.close()
        pause = (strs[1] == "True")
        pause = not pause
    with open(user_path + 'flags', "w") as f:
        f.write(sim.__str__() + "\n" + pause.__str__() + "\n")
        f.close()
    return render_index(poST_code, Py_code, out, user_path, sim, pause)


def translate(clientSocket, user_path):
    stopSim(user_path)
    poST_code = request.form["poST_code"]
    save_code(user_path, poST_code)
    try:
        clientSocket.connect(("localhost", 8081))
        clientSocket.send((user_path + '\n').encode())
        dataFromServer = clientSocket.recv(1024)
    except Exception:
        try:
            clientSocket.close()
            clientSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            clientSocket.connect(("localhost", 8081))
        except Exception:
            subprocess.run(["./translate.sh", str(session['user'])])
    Py_code = None
    if os.path.exists(user_path + "poST_code.py"):
        Py_code = read_from_file(user_path + "poST_code.py")
    out = read_from_file(user_path + "out")
    return render_index(poST_code, Py_code, out, user_path, False, False)


def openPoST(user_path):
    stopSim(user_path)
    input_file = request.files["file"]
    poST_code = input_file.read(4 * 1024 * 1024 + 1).decode("utf-8")
    save_code(user_path, poST_code)
    return render_index(poST_code, None, None, user_path, False, False)


def loadInputs(user_path):
    with open(user_path + "sim_in", "w") as f:
        f.write("\n".join(request.form.getlist('inputcheck')))
        f.close()
    poST_code = request.form["poST_code"]
    Py_code = None
    if os.path.exists(user_path + "poST_code.py"):
        Py_code = read_from_file(user_path + "poST_code.py")
    out = read_from_file(user_path + "out")
    with open(user_path + "flags", "r") as f:
        strs = f.read().splitlines()
        f.close()
        sim = (strs[0] == "True")
        pause = (strs[1] == "True")
    return render_index(poST_code, Py_code, out, user_path, sim, pause)


@app.route('/', methods=["POST"])
def user_post_methods():
    clientSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    user_path = 'sessions/' + str(session['user']) + '/'

    if request.form["action"] == "translate":
        return translate(clientSocket, user_path)

    elif request.form["action"] == "openPoST" and 'file' in request.files:
        return openPoST(user_path)

    elif request.form["action"] == "downloadPoST":
        return send_file(user_path + "code.post", download_name='code.post', as_attachment=True)

    elif request.form["action"] == "downloadPy":
        return send_file(user_path + "poST_code.py", download_name='poST_code.py', as_attachment=True)

    elif request.form["action"] == "startSim":
        return startSim(user_path)

    elif request.form["action"] == "stopSim":
        return stopSim(user_path)

    elif request.form["action"] == "pauseSim":
        return pauseSim(user_path)

    elif request.form["action"] == "loadInputs":
        return loadInputs(user_path)


@app.route('/', methods=["GET"])
def get_main():
    if 'user' in session:
        user_path = './sessions/' + str(session['user']) + '/'
        if os.path.exists(user_path + "code.post"):
            poST_code = read_from_file(user_path + "code.post")
            if os.path.exists(user_path + "poST_code.py"):
                Py_code = read_from_file(user_path + "poST_code.py")
                out = read_from_file(user_path + "out")
                with open(user_path + "flags", "r") as f:
                    strs = f.read().splitlines()
                    f.close()
                    try:
                        sim = (strs[0] == "True")
                        pause = (strs[1] == "True")
                    except:
                        sim = False
                        pause = False
                return render_index(poST_code, Py_code, out, user_path, sim, pause)
            return render_index(poST_code, None, None, user_path, False, False)
        else:
            pathlib.Path(user_path).mkdir(parents=True, exist_ok=True)
    else:
        session['user'] = uuid.uuid4()
        user_path = './sessions/' + str(session['user']) + '/'
        pathlib.Path(user_path).mkdir(parents=True, exist_ok=True)
        if not os.path.exists("./" + user_path + 'output_outputs'):
            subprocess.run(["touch", user_path + 'output_outputs'])
        if not os.path.exists("./" + user_path + 'inputs'):
            subprocess.run(["touch", user_path + 'inputs'])
        if not os.path.exists("./" + user_path + 'flags'):
            with open(user_path + 'flags', "w") as f:
                f.write(False.__str__() + "\n" + False.__str__() + "\n")
                f.close()
    return render_index(None, None, None, user_path, False, False)


@app.route('/sessions/<session_id>/outputs', methods=["GET"])
def get_outputs(session_id):
    if os.path.exists('./sessions/' + session_id + '/output'):
        f = open('./sessions/' + session_id + '/output', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='text/plain')
    subprocess.run(["touch", './sessions/' + session_id + '/output'])
    f = open('./sessions/' + session_id + '/output', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='text/plain')


@app.route('/sessions/<session_id>/states', methods=["GET"])
def get_states(session_id):
    if os.path.exists('./sessions/' + session_id + '/states'):
        f = open('./sessions/' + session_id + '/states', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='text/plain')
    subprocess.run(["touch", './sessions/' + session_id + '/states'])
    f = open('./sessions/' + session_id + '/states', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='text/plain')


@app.route('/sessions/<session_id>/inputs', methods=["GET"])
def get_inputs(session_id):
    if os.path.exists('./sessions/' + session_id + '/inputs'):
        f = open('./sessions/' + session_id + '/inputs', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='text/plain')
    subprocess.run(["touch", './sessions/' + session_id + '/inputs'])
    f = open('./sessions/' + session_id + '/inputs', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='text/plain')


@app.route('/sessions/<session_id>/times', methods=["GET"])
def get_times(session_id):
    if os.path.exists('./sessions/' + session_id + '/times'):
        f = open('./sessions/' + session_id + '/times', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='text/plain')
    subprocess.run(["touch", './sessions/' + session_id + '/times'])
    f = open('./sessions/' + session_id + '/times', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='text/plain')


@app.route('/sessions/<session_id>/globvars', methods=["GET"])
def get_globvars(session_id):
    if os.path.exists('./sessions/' + session_id + '/glob_vars'):
        f = open('./sessions/' + session_id + '/glob_vars', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='text/plain')
    subprocess.run(["touch", './sessions/' + session_id + '/glob_vars'])
    f = open('./sessions/' + session_id + '/glob_vars', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='text/plain')


@app.route('/sessions/<session_id>/vars', methods=["GET"])
def get_vars(session_id):
    if os.path.exists('./sessions/' + session_id + '/vars'):
        f = open('./sessions/' + session_id + '/vars', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='text/plain')
    subprocess.run(["touch", './sessions/' + session_id + '/vars'])
    f = open('./sessions/' + session_id + '/vars', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='text/plain')


if __name__ == "__main__":
    subprocess.run(["chmod", "+x", "translate.sh"])
    app.run(host='0.0.0.0')
