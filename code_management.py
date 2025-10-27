import json
import subprocess
import os
import socket
from file_utils import read_from_file
from flask import request, session
from rendering import render_index
from simulation_control import stopSimJSON


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


def savePoST(user_path):
    poST_code = request.form["poST_code"]
    plant_code = request.form["plant_poST_code"]
    save_code(user_path, poST_code, "code.post")
    save_code(user_path, plant_code, "plant_code.post")
    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


def translate(clientSocket, user_path):
    stopSimJSON(user_path)
    poST_code = request.form["poST_code"]
    plant_code = request.form["plant_poST_code"]
    savePoST(user_path)
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
            subprocess.run(f"./translate.sh {str(session['user'])}", shell=True)
            subprocess.run(f"./translate_plant.sh {str(session['user'])}", shell=True)
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


def openPoST(user_path):
    stopSimJSON(user_path)
    print(request.files)
    if "file" in request.files:
        controller_file = request.files["file"]
        poST_code = controller_file.read().decode("utf-8")
    else:
        poST_code = ""
    save_code(user_path, poST_code, "code.post")

    if "file_plant" in request.files:
        plant_file = request.files["file_plant"]
        plant_poST_code = plant_file.read().decode("utf-8")
    else:
        plant_poST_code = ""
    save_code(user_path, plant_poST_code, "plant_code.post")

    if os.path.exists(user_path + "poST_code.py"):
        Py_code = read_from_file(user_path + "poST_code.py")
    else:
        Py_code = ""
    if os.path.exists(user_path + "plant_code.py"):
        plant_Py_code = read_from_file(user_path + "plant_code.py")
    else:
        plant_Py_code = ""
    return render_index(poST_code, plant_poST_code, Py_code, plant_Py_code, "", "", user_path, False, False)