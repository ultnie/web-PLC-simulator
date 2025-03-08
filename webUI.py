import json
import os
import pathlib
import shutil
import socket
import subprocess
import uuid
import psutil

from flask import Flask, render_template, session, request, send_file, Response, jsonify

app = Flask(__name__)
app.secret_key = 'web-poST Simulator'.encode()

# Store the simulation process globally
simulation_process = None


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


def run_program(clientSocket, user_path):
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

    copytree("./sim", "./" + user_path + "sim")
    shutil.copyfile(user_path + "poST_code.py", user_path + "sim/poST_code.py")
    poST_code = request.form["poST_code"]
    Py_code = None
    if os.path.exists(user_path + "poST_code.py"):
        Py_code = read_from_file(user_path + "poST_code.py")
    out = read_from_file(user_path + "out")
    open(user_path + "output", 'w').close()
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


def startSimJSON(user_path):
    global simulation_process
    try:
        if not user_path.endswith('/'):
            user_path += '/'

        if not os.path.exists(user_path + "sim"):
            os.makedirs(user_path + "sim")

        copytree("./sim", user_path + "sim")

        if not os.path.exists(user_path + "poST_code.py"):
            raise FileNotFoundError(f"File not found: {user_path}poST_code.py")

        shutil.copyfile(user_path + "poST_code.py", user_path + "sim/poST_code.py")

        open(user_path + "output_outputs", 'w').close()
        open(user_path + "inputs", 'w').close()
        open(user_path + "flags", 'w').close()

        print('Files created')

        sim = True
        pause = False

        with open(user_path + "flags", "w") as f:
            f.write(f"{sim}\n{pause}\n")

        print('Flags created')
        print(user_path)

        # Start subprocess and store it
        simulation_process = subprocess.Popen(["./startSim.sh", user_path])

        return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}

    except Exception as e:
        print(f"Error: {e}")
        return json.dumps({'success': False, 'error': str(e)}), 400, {'ContentType': 'application/json'}

def pauseSimJSON(user_path):
    try:
        sim = True

        # Check if 'flags' file exists
        flags_path = user_path + 'flags'
        if not os.path.exists(flags_path):
            raise FileNotFoundError(f"Flags file not found at: {flags_path}")

        with open(flags_path, "r") as f:
            strs = f.read().splitlines()
            if len(strs) < 2:
                raise ValueError("Invalid content in flags file")
            pause = (strs[1] == "True")
            pause = not pause

        with open(flags_path, "w") as f:
            f.write(f"{sim}\n{pause}\n")

        print("Simulation paused:", pause)
        return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}

    except Exception as e:
        print(f"Error in pauseSimJSON: {e}")
        return json.dumps({'success': False, 'error': str(e)}), 400, {'ContentType': 'application/json'}


def stopSimJSON(user_path):
    global simulation_process
    try:
        sim = False
        pause = False

        flags_path = user_path + 'flags'
        output_path = user_path + 'output_outputs'
        inputs_path = user_path + 'inputs'

        with open(flags_path, "w") as f:
            f.write(f"{sim}\n{pause}\n")

        open(output_path, 'w').close()
        open(inputs_path, 'w').close()
        open(flags_path, 'w').close()

        # Kill the process and any child processes
        if simulation_process and simulation_process.poll() is None:
            parent = psutil.Process(simulation_process.pid)
            children = parent.children(recursive=True)
            for child in children:
                print(f"Killing child process {child.pid}")
                child.terminate()
            parent.terminate()

            # Ensure processes are cleaned up
            gone, still_alive = psutil.wait_procs(children, timeout=5)
            if still_alive:
                for child in still_alive:
                    print(f"Force killing child process {child.pid}")
                    child.kill()

            simulation_process.wait()
            print("Simulation process and all children terminated")

        simulation_process = None

        print("Simulation stopped")
        return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}

    except Exception as e:
        print(f"Error in stopSimJSON: {e}")
        return json.dumps({'success': False, 'error': str(e)}), 400, {'ContentType': 'application/json'}


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


def loadInputsJSON(user_path):
    try:
        # Debugging
        print(f"Content-Type: {request.content_type}")
        print(f"Raw data: {request.form}")

        # We no longer check for application/json — the server expects form data
        if "action" not in request.form:
            raise ValueError("No action provided in form data")

        action = request.form["action"]
        if action != "loadInputs":
            raise ValueError(f"Unexpected action: {action}")

        # Parse the JSON string from the form field
        inputs = json.loads(request.form["inputs"])
        print("Received inputs:", inputs)

        # Save inputs into sim_in
        with open(user_path + "/sim_in", "w") as f:
            json.dump(inputs, f, indent=4)

        return jsonify(success=True)

    except Exception as e:
        print(f"Error loading inputs: {e}")
        return jsonify(success=False, error=str(e)), 400


@app.route('/', methods=["POST"])
def user_post_methods():
    clientSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    user_path = 'sessions/' + str(session['user']) + '/'

    print(request, request.form['action'])

    if request.form["action"] == "translate":
        return translate(clientSocket, user_path)

    elif request.form["action"] == "openPoST" and 'file' in request.files:
        return openPoST(user_path)

    elif request.form["action"] == "downloadPoST":
        return send_file(user_path + "code.post", download_name='code.post', as_attachment=True)

    elif request.form["action"] == "downloadPy":
        return send_file(user_path + "poST_code.py", download_name='poST_code.py', as_attachment=True)

    elif request.form["action"] == "startSim":
        return startSimJSON(user_path)

    elif request.form["action"] == "stopSim":
        return stopSimJSON(user_path)

    elif request.form["action"] == "pauseSim":
        return pauseSimJSON(user_path)

    elif request.form["action"] == "runProgram":
        return run_program(clientSocket, user_path)

    elif request.form["action"] == "stopProgram":
        return stop_program(user_path)

    elif request.form["action"] == "pauseProgram":
        return pause_program(user_path)

    elif request.form["action"] == "loadInputs":
        print("loading inputs")
        return loadInputsJSON(user_path)


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
        # TODO: создать остальные файлы выводов (просто на всякий, так-то их создаст симулятор)
        if not os.path.exists("./" + user_path + 'output'):
            open(user_path + "/output", 'w').close()
        if not os.path.exists("./" + user_path + 'inputs'):
            open(user_path + "/inputs", 'w').close()
        if not os.path.exists("./" + user_path + 'flags'):
            with open(user_path + 'flags', "w") as f:
                f.write(False.__str__() + "\n" + False.__str__() + "\n")
                f.close()
    return render_index(None, None, None, user_path, False, False)


@app.route('/sessions/<session_id>/outputs', methods=["GET"])
def get_outputs(session_id):
    if os.path.exists('./sessions/' + session_id + '/all'):
        f = open('./sessions/' + session_id + '/all', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='application/json')
    subprocess.run(["touch", './sessions/' + session_id + '/all'])
    f = open('./sessions/' + session_id + '/all', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='application/json')


@app.route('/sessions/<session_id>/states', methods=["GET"])
def get_states(session_id):
    if os.path.exists('./sessions/' + session_id + '/states'):
        f = open('./sessions/' + session_id + '/states', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='application/json')
    subprocess.run(["touch", './sessions/' + session_id + '/states'])
    f = open('./sessions/' + session_id + '/states', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='application/json')


@app.route('/sessions/<session_id>/inputs', methods=["GET"])
def get_inputs(session_id):
    if os.path.exists('./sessions/' + session_id + '/inputs'):
        f = open('./sessions/' + session_id + '/inputs', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='application/json')
    subprocess.run(["touch", './sessions/' + session_id + '/inputs'])
    f = open('./sessions/' + session_id + '/inputs', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='application/json')


@app.route('/sessions/<session_id>/times', methods=["GET"])
def get_times(session_id):
    if os.path.exists('./sessions/' + session_id + '/times'):
        f = open('./sessions/' + session_id + '/times', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='application/json')
    subprocess.run(["touch", './sessions/' + session_id + '/times'])
    f = open('./sessions/' + session_id + '/times', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='application/json')


@app.route('/sessions/<session_id>/globvars', methods=["GET"])
def get_globvars(session_id):
    if os.path.exists('./sessions/' + session_id + '/glob_vars'):
        f = open('./sessions/' + session_id + '/glob_vars', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='application/json')
    subprocess.run(["touch", './sessions/' + session_id + '/glob_vars'])
    f = open('./sessions/' + session_id + '/glob_vars', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='application/json')


@app.route('/sessions/<session_id>/vars', methods=["GET"])
def get_vars(session_id):
    if os.path.exists('./sessions/' + session_id + '/vars'):
        f = open('./sessions/' + session_id + '/vars', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='application/json')
    subprocess.run(["touch", './sessions/' + session_id + '/vars'])
    f = open('./sessions/' + session_id + '/vars', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='application/json')


if __name__ == "__main__":
    subprocess.run(["chmod", "+x", "translate.sh"])
    app.run(host='0.0.0.0')
