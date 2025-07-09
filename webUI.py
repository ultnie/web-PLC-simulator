import json
import os
import pathlib
import socket
import subprocess
import uuid
import psutil
import api_file_map

from file_utils import read_from_file
from code_management import translate, openPoST
from simulation_control import startSimJSON, stopSimJSON, pauseSimJSON, stepOnceJSON, changeTime
from rendering import render_index

from flask import Flask, session, request, send_file, Response, jsonify, abort
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = 'web-poST Simulator'.encode()
CORS(app)


@app.route('/', methods=["POST"])
def user_post_methods():
    clientSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    user_path = 'sessions/' + str(session['user']) + '/'

    print(request, request.form['action'])

    if request.form["action"] == "translate":
        return translate(clientSocket, user_path)

    elif request.form["action"] == "openPoST":
        return openPoST(user_path)

    elif request.form["action"] == "downloadPoST":
        return send_file(user_path + "code.post", download_name='controller_code.post', as_attachment=True)
    elif request.form["action"] == "downloadPoST_plant":
        return send_file(user_path + "plant_code.post", download_name='plant_code.post', as_attachment=True)

    elif request.form["action"] == "downloadPy":
        return send_file(user_path + "poST_code.py", download_name='controller_code.py', as_attachment=True)
    elif request.form["action"] == "downloadPy_plant":
        return send_file(user_path + "plant_code.py", download_name='plant_code.py', as_attachment=True)

    elif request.form["action"] == "startSim":
        return startSimJSON(user_path)

    elif request.form["action"] == "stepSim":
        return stepOnceJSON(user_path)

    elif request.form["action"] == "stopSim":
        return stopSimJSON(user_path)

    elif request.form["action"] == "pauseSim":
        return pauseSimJSON(user_path)

    elif request.form["action"] == "changeTime":
        return changeTime(user_path)


@app.route('/sessions/<session_id>/load_inputs', methods=["POST"])
def loadInputsJSON(session_id):
    user_path = "sessions/" + session_id
    try:
        print(f"Content-Type: {request.content_type}")
        print(f"Raw data: {request.form}")

        if "action" not in request.form:
            raise ValueError("No action provided in form data")

        action = request.form["action"]
        if action != "loadInputs":
            raise ValueError(f"Unexpected action: {action}")

        inputs = json.loads(request.form["inputs"])
        print("Received controller inputs:", inputs)

        plant_inputs = json.loads(request.form["plant_inputs"])
        print("Received plant inputs:", plant_inputs)

        global_inputs = json.loads(request.form["global_inputs"])
        print("Received global inputs:", global_inputs)

        with open(user_path + "/control_sim_in", "w") as f:
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


@app.route('/', methods=['GET'])
def index():
    # Get user from session or create a new one
    if 'user' not in session:
        session['user'] = str(uuid.uuid4())
    user_path = f'./sessions/{session["user"]}/'

    # Ensure user_path directory exists
    pathlib.Path(user_path).mkdir(parents=True, exist_ok=True)

    # Initialize variables
    poST_code = ""
    plant_code = ""
    poST_code_py = ""
    plant_code_py = ""
    out = ""
    plant_out = ""
    simulation_flag = False
    pause_flag = False

    # Read flags file if it exists
    flags_path = user_path + "flags"
    if os.path.exists(flags_path):
        try:
            with open(flags_path, "r") as f:
                lines = f.read().splitlines()
                simulation_flag = lines[0].lower() == "true" if len(lines) > 0 else False
                pause_flag = lines[1].lower() == "true" if len(lines) > 1 else False
        except Exception:
            # fallback to defaults if reading fails
            simulation_flag = False
            pause_flag = False
    else:
        # Create flags file with default values if missing
        with open(flags_path, "w") as f:
            f.write("False\nFalse\n")

    # Helper to safely read files
    def safe_read(path):
        try:
            return read_from_file(path)
        except Exception:
            return ""

    # Read all relevant files safely
    poST_code = safe_read(user_path + "code.post")
    plant_code = safe_read(user_path + "plant_code.post")
    poST_code_py = safe_read(user_path + "poST_code.py")
    plant_code_py = safe_read(user_path + "plant_code.py")
    out = safe_read(user_path + "out")
    plant_out = safe_read(user_path + "plant_out")

    # Render the index page
    return render_index(poST_code, plant_code, poST_code_py, plant_code_py, out, plant_out, user_path, simulation_flag, pause_flag)


@app.route('/sessions/<session_id>/<file_key>', methods=["GET"])
def get_session_file(session_id, file_key):
    if file_key not in api_file_map.FILE_MAP:
        abort(404, description=f"Unknown file key: {file_key}")

    file_name = api_file_map.FILE_MAP[file_key]
    file_path = f'./sessions/{session_id}/{file_name}'

    if not os.path.exists(file_path):
        subprocess.run(["touch", file_path])

    with open(file_path, 'r') as f:
        text = f.read()

    return Response(text, mimetype='application/json')


if __name__ == "__main__":
    app.run(host='0.0.0.0')
