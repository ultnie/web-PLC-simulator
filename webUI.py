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
simulation_process = {}
simulation_status = {}
pauses = {}


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


def save_code(path, code, filename):
    os.makedirs(path, exist_ok=True)
    if os.path.exists(path + filename):
        subprocess.run(["rm", path + filename])
        subprocess.run(["rm", path + "out"])
        subprocess.run(["rm", path + "plant_out"])
    subprocess.run(["touch", path + "out"])
    subprocess.run(["touch", path + "plant_out"])
    with open(path + filename, "w") as f:
        f.write("\n".join(code.splitlines()))
        f.close()


def render_index(poST_code, plant_code, Py_code, plant_Py_code, out, plant_out, path, sim, pause):
    if sim:
        return render_template("index.html", poST_code=poST_code, plant_poST_code=plant_code, Py_code=Py_code, plant_Py_code=plant_Py_code, out=out, plant_out=plant_out,
                               outputs=path + "outputs", plant_outputs=path+"plant_outputs", inputs=path + "inputs", plant_inputs=path+"plant_inputs", globals = path + "globvars",
                               disable_start="disabled", sim=str(sim).lower(),
                               Pause="Pause simulation" if not pause else "Unpause simulation")
    if Py_code is not None:
        return render_template("index.html", poST_code=poST_code, plant_poST_code=plant_code, Py_code=Py_code, plant_Py_code=plant_Py_code, out=out, plant_out=plant_out,
                               outputs=path + "outputs", plant_outputs=path+"plant_outputs", inputs=path + "inputs", plant_inputs=path+"plant_inputs", globals = path + "globvars",
                               disable_inputs="disabled", disable_stop="disabled", disable_pause="disabled",
                               sim=str(sim).lower(), Pause="Pause simulation" if not pause else "Unpause simulation")
    if out is not None:
        return render_template("index.html", poST_code=poST_code, plant_poST_code=plant_code, Py_code=Py_code, plant_Py_code=plant_Py_code, out=out, plant_out=plant_out,
                               outputs=path + "outputs", plant_outputs=path+"plant_outputs", inputs=path + "inputs", plant_inputs=path+"plant_inputs", globals = path + "globvars",
                               disable_pause="disabled", disable_Py="disabled", disable_inputs="disabled",
                               disable_start="disabled", disable_stop="disabled", sim=str(sim).lower(),
                               Pause="Pause simulation" if not pause else "Unpause simulation")
    if poST_code is not None:
        return render_template("index.html", poST_code=poST_code, plant_poST_code=plant_code, Py_code=Py_code, plant_Py_code=plant_Py_code, out=out, plant_out=plant_out,
                               outputs=path + "outputs", plant_outputs=path+"plant_outputs", inputs=path + "inputs", plant_inputs=path+"plant_inputs", globals = path + "globvars",
                               disable_Py="disabled", disable_pause="disabled", disable_inputs="disabled",
                               disable_start="disabled", disable_stop="disabled", sim=str(sim).lower(),
                               Pause="Pause simulation" if not pause else "Unpause simulation")

    return render_template("index.html", outputs=path + "outputs", plant_outputs=path+"plant_outputs", inputs=path + "inputs", plant_inputs=path+"plant_inputs", globals = path + "globvars",
                           disable_poST="disabled", disable_Py="disabled", disable_pause="disabled",
                           disable_inputs="disabled", disable_start="disabled", disable_stop="disabled",
                           sim=str(sim).lower(), Pause="Pause simulation" if not pause else "Unpause simulation")


#TODO: не используется, как и все функции с render_index кроме translate и openPoST, но возможно стоит поправить вызов render_index
def startSim(user_path):
    copytree("./sim", "./"+user_path+"sim")
    shutil.copyfile(user_path + "poST_code.py", user_path+"sim/poST_code.py")
    poST_code = request.form["poST_code"]
    Py_code = None
    if os.path.exists(user_path + "poST_code.py"):
        Py_code = read_from_file(user_path + "poST_code.py")
    out = read_from_file(user_path + "out")
    plant_out = read_from_file(user_path + "plant_out")
    open(user_path + "output_outputs", 'w').close()
    open(user_path + "inputs", 'w').close()
    open(user_path + "flags", 'w').close()
    simulation_status[user_path] = True
    pauses[user_path] = False
    with open(user_path + 'flags', "w") as f:
        f.write(simulation_status[user_path].__str__() + "\n" + pauses[user_path].__str__() + "\n")
        f.close()
    print(user_path)
    subprocess.Popen(["./startSim.sh", user_path])
    return render_index(poST_code, Py_code, out, plant_out, user_path, simulation_status[user_path], pauses[user_path])


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
    simulation_status[user_path] = True
    pauses[user_path] = False
    with open(user_path + 'flags', "w") as f:
        f.write(simulation_status[user_path].__str__() + "\n" + pauses[user_path].__str__() + "\n")
        f.close()
    print(user_path)
    subprocess.Popen(["./startSim.sh", user_path])
    return render_index(poST_code, Py_code, out, user_path, simulation_status[user_path], pauses[user_path])


def stopSim(user_path):
    poST_code = request.form["poST_code"]
    Py_code = None
    out = None
    if os.path.exists(user_path + "poST_code.py"):
        Py_code = read_from_file(user_path + "poST_code.py")
    if os.path.exists(user_path + "out"):
        out = read_from_file(user_path + "out")
    simulation_status[user_path] = False
    pauses[user_path] = False
    with open(user_path + 'flags', "w") as f:
        f.write(simulation_status[user_path].__str__() + "\n" + pauses[user_path].__str__() + "\n")
        f.close()
    open(user_path + "output_outputs", 'w').close()
    open(user_path + "inputs", 'w').close()
    open(user_path + "flags", 'w').close()
    return render_index(poST_code, Py_code, out, user_path, simulation_status[user_path], pauses[user_path])


def pauseSim(user_path):
    poST_code = request.form["poST_code"]
    Py_code = None
    if os.path.exists(user_path + "poST_code.py"):
        Py_code = read_from_file(user_path + "poST_code.py")
    out = read_from_file(user_path + "out")
    simulation_status[user_path] = True
    with open(user_path + 'flags', "r") as f:
        strs = f.read().splitlines()
        f.close()
        pauses[user_path] = (strs[1] == "True")
        pauses[user_path] = not pauses[user_path]
    with open(user_path + 'flags', "w") as f:
        f.write(simulation_status[user_path].__str__() + "\n" + pauses[user_path].__str__() + "\n")
        f.close()
    return render_index(poST_code, Py_code, out, user_path, simulation_status[user_path], pauses[user_path])


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

        if not os.path.exists(user_path + "plant_code.py"):
            raise FileNotFoundError(f"File not found: {user_path}plant_code.py")

        shutil.copyfile(user_path + "poST_code.py", user_path + "sim/poST_code.py")
        shutil.copyfile(user_path + "plant_code.py", user_path + "sim/plant_code.py")

        open(user_path + "output_outputs", 'w').close()
        open(user_path + "inputs", 'w').close()
        open(user_path + "plant_output_outputs", 'w').close()
        open(user_path + "plant_inputs", 'w').close()
        open(user_path + "flags", 'w').close()

        print('Files created')

        simulation_status[user_path] = True
        pauses[user_path] = False

        with open(user_path + "flags", "w") as f:
            f.write(f"{simulation_status[user_path]}\n{pauses[user_path]}\n")

        print('Flags created')
        print(user_path)

        # Start subprocess and store it
        simulation_process[user_path] = subprocess.Popen(["./startSim.sh", user_path])

        return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}

    except Exception as e:
        print(f"Error: {e}")
        return json.dumps({'success': False, 'error': str(e)}), 400, {'ContentType': 'application/json'}


def pauseSimJSON(user_path):
    try:
        simulation_status[user_path] = True

        # Check if 'flags' file exists
        flags_path = user_path + 'flags'
        if not os.path.exists(flags_path):
            raise FileNotFoundError(f"Flags file not found at: {flags_path}")

        with open(flags_path, "r") as f:
            strs = f.read().splitlines()
            if len(strs) < 2:
                raise ValueError("Invalid content in flags file")
            pauses[user_path] = (strs[1] == "True")
            pauses[user_path] = not pauses[user_path]

        with open(flags_path, "w") as f:
            f.write(f"{simulation_status[user_path]}\n{pauses[user_path]}\n")

        print("Simulation paused:", pauses[user_path])
        return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}

    except Exception as e:
        print(f"Error in pauseSimJSON: {e}")
        return json.dumps({'success': False, 'error': str(e)}), 400, {'ContentType': 'application/json'}


def stopSimJSON(user_path):
    global simulation_process
    try:
        simulation_status[user_path] = False
        pauses[user_path] = False

        flags_path = user_path + 'flags'
        output_path = user_path + 'output_outputs'
        plant_output_path = user_path + 'plant_output_outputs'
        inputs_path = user_path + 'inputs'
        plant_inputs_path = user_path + 'plant_inputs'

        with open(flags_path, "w") as f:
            f.write(f"{simulation_status[user_path]}\n{pauses[user_path]}\n")

        open(output_path, 'w').close()
        open(plant_output_path, 'w').close()
        open(inputs_path, 'w').close()
        open(plant_inputs_path, 'w').close()
        open(flags_path, 'w').close()

        # Kill the process and any child processes
        if simulation_process[user_path] and simulation_process[user_path].poll() is None:
            parent = psutil.Process(simulation_process[user_path].pid)
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

            simulation_process[user_path].wait()
            print("Simulation process and all children terminated")

        simulation_process[user_path] = None

        print("Simulation stopped")
        return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}

    except Exception as e:
        print(f"Error in stopSimJSON: {e}")
        return json.dumps({'success': False, 'error': str(e)}), 400, {'ContentType': 'application/json'}


def translate(clientSocket, user_path):
    stopSimJSON(user_path)
    poST_code = request.form["poST_code"]
    plant_code = request.form["plant_poST_code"]
    save_code(user_path, poST_code, "code.post")
    save_code(user_path, plant_code, "plant_code.post")
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
            subprocess.run(["./translate_plant.sh", str(session['user'])])
    Py_code = None
    plant_Py_code = None
    if os.path.exists(user_path + "poST_code.py"):
        Py_code = read_from_file(user_path + "poST_code.py")
    else:
        open(user_path + "/poST_code.py", 'w').close()
        Py_code = read_from_file(user_path + "poST_code.py")
    if os.path.exists(user_path + "plant_code.py"):
        plant_Py_code = read_from_file(user_path + "plant_code.py")
    else:
        open(user_path + "/plant_code.py", 'w').close()
        plant_Py_code = read_from_file(user_path + "plant_code.py")
    out = read_from_file(user_path + "out")
    plant_out = read_from_file(user_path + "plant_out")
    return render_index(poST_code, plant_code, Py_code, plant_Py_code, out, plant_out, user_path, False, False)

#TODO: openPoST для plant
def openPoST(user_path):
    stopSimJSON(user_path)
    input_file = request.files["file"]
    poST_code = input_file.read(4 * 1024 * 1024 + 1).decode("utf-8")
    save_code(user_path, poST_code, "code.post")
    return render_index(poST_code, "", "", "", "", "", user_path, False, False)


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
        simulation_status[user_path] = (strs[0] == "True")
        pauses[user_path] = (strs[1] == "True")
    return render_index(poST_code, Py_code, out, user_path, simulation_status[user_path], pauses[user_path])


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
        print("Received controller inputs:", inputs)

        plant_inputs = json.loads(request.form["plant_inputs"])
        print("Received plant inputs:", plant_inputs)

        global_inputs = json.loads(request.form["global_inputs"])
        print("Received global inputs:", global_inputs)

        # Save inputs into sim_in
        with open(user_path + "/sim_in", "w") as f:
            json.dump(inputs, f, indent=4)
            f.close()

        with open(user_path + "/plant_sim_in", "w") as f:
            json.dump(plant_inputs, f, indent=4)
            f.close()

        with open(user_path + "/global_sim_in", "w") as f:
            json.dump(global_inputs, f, indent=4)
            f.close()

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

    #TODO: openPoST для plant
    elif request.form["action"] == "openPoST" and 'file' in request.files:
        return openPoST(user_path)
    #TODO: downloadPoST для plant
    elif request.form["action"] == "downloadPoST":
        return send_file(user_path + "code.post", download_name='code.post', as_attachment=True)
    #TODO: downloadPy для plant
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
    # TODO: loadInputs для plant
    elif request.form["action"] == "loadInputs":
        print("loading inputs")
        return loadInputsJSON(user_path)


@app.route('/', methods=["GET"])
def get_main():
    if 'user' in session:
        user_path = './sessions/' + str(session['user']) + '/'
        if os.path.exists(user_path + "code.post"):
            poST_code = read_from_file(user_path + "code.post")
            plant_code = read_from_file(user_path + "plant_code.post")
            if os.path.exists(user_path + "poST_code.py"):
                Py_code = read_from_file(user_path + "poST_code.py")
                plant_Py_code = read_from_file(user_path + "plant_code.py")
                out = read_from_file(user_path + "out")
                plant_out = read_from_file(user_path + "plant_out")
                with open(user_path + "flags", "r") as f:
                    strs = f.read().splitlines()
                    f.close()
                    try:
                        simulation_status[user_path] = (strs[0] == "True")
                        pauses[user_path] = (strs[1] == "True")
                    except:
                        simulation_status[user_path] = False
                        pauses[user_path] = False
                return render_index(poST_code, plant_code, Py_code, plant_Py_code, out, plant_out, user_path, simulation_status[user_path], pauses[user_path])
            return render_index(poST_code, plant_code, "", "", "", "", user_path, False, False)
        else:
            pathlib.Path(user_path).mkdir(parents=True, exist_ok=True)
    else:
        session['user'] = uuid.uuid4()
        user_path = './sessions/' + str(session['user']) + '/'
        pathlib.Path(user_path).mkdir(parents=True, exist_ok=True)
        if not os.path.exists("./" + user_path + 'output'):
            open(user_path + "/output", 'w').close()
        if not os.path.exists("./" + user_path + 'inputs'):
            open(user_path + "/inputs", 'w').close()
        if not os.path.exists("./" + user_path + 'flags'):
            with open(user_path + 'flags', "w") as f:
                f.write(False.__str__() + "\n" + False.__str__() + "\n")
                f.close()
    return render_index("", "", "", "", "", "", user_path, False, False)



#TODO: get-методы для plant
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


@app.route('/sessions/<session_id>/plant_outputs', methods=["GET"])
def get_plant_outputs(session_id):
    if os.path.exists('./sessions/' + session_id + '/plant_all'):
        f = open('./sessions/' + session_id + '/plant_all', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='application/json')
    subprocess.run(["touch", './sessions/' + session_id + '/plant_all'])
    f = open('./sessions/' + session_id + '/plant_all', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='application/json')


@app.route('/sessions/<session_id>/plant_states', methods=["GET"])
def get_plant_states(session_id):
    if os.path.exists('./sessions/' + session_id + '/plant_states'):
        f = open('./sessions/' + session_id + '/plant_states', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='application/json')
    subprocess.run(["touch", './sessions/' + session_id + '/plant_states'])
    f = open('./sessions/' + session_id + '/plant_states', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='application/json')


@app.route('/sessions/<session_id>/plant_inputs', methods=["GET"])
def get_plant_inputs(session_id):
    if os.path.exists('./sessions/' + session_id + '/plant_inputs'):
        f = open('./sessions/' + session_id + '/plant_inputs', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='application/json')
    subprocess.run(["touch", './sessions/' + session_id + '/plant_inputs'])
    f = open('./sessions/' + session_id + '/plant_inputs', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='application/json')


@app.route('/sessions/<session_id>/plant_times', methods=["GET"])
def get_plant_times(session_id):
    if os.path.exists('./sessions/' + session_id + '/plant_times'):
        f = open('./sessions/' + session_id + '/plant_times', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='application/json')
    subprocess.run(["touch", './sessions/' + session_id + '/plant_times'])
    f = open('./sessions/' + session_id + '/plant_times', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='application/json')


@app.route('/sessions/<session_id>/plant_globvars', methods=["GET"])
def get_plant_globvars(session_id):
    if os.path.exists('./sessions/' + session_id + '/plant_glob_vars'):
        f = open('./sessions/' + session_id + '/plant_glob_vars', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='application/json')
    subprocess.run(["touch", './sessions/' + session_id + '/plant_glob_vars'])
    f = open('./sessions/' + session_id + '/plant_glob_vars', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='application/json')


@app.route('/sessions/<session_id>/plant_vars', methods=["GET"])
def get_plant_vars(session_id):
    if os.path.exists('./sessions/' + session_id + '/plant_vars'):
        f = open('./sessions/' + session_id + '/plant_vars', 'r')
        text = f.read()
        f.close()
        return Response(text, mimetype='application/json')
    subprocess.run(["touch", './sessions/' + session_id + '/plant_vars'])
    f = open('./sessions/' + session_id + '/plant_vars', 'r')
    text = f.read()
    f.close()
    return Response(text, mimetype='application/json')


if __name__ == "__main__":
    subprocess.run(["chmod", "+x", "translate.sh"])
    subprocess.run(["chmod", "+x", "startSim.sh"])
    app.run(host='0.0.0.0')
