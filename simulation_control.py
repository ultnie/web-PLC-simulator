import json
import shutil
import os
import api_file_map
import subprocess
import psutil

from file_utils import copytree
from flask import request, jsonify


simulation_process = {}
simulation_status = {}
pauses = {}


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

        open(user_path + api_file_map.FILE_MAP["inputs"], 'w').close()
        open(user_path + api_file_map.FILE_MAP["plant_inputs"], 'w').close()
        open(user_path + api_file_map.FILE_MAP["time_scale"], 'w').close()

        print('Files created')

        simulation_status[user_path] = True
        pauses[user_path] = False

        with open(user_path + "flags", "w") as f:
            f.write("True\nFalse\nFalse\n")  # stopSim, pauseSim, stepOnce

        print('Flags created')
        print(user_path)

        simulation_process[user_path] = subprocess.Popen(f"./startSim.sh {user_path}", shell=True)

        return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}

    except Exception as e:
        print(f"Error: {e}")
        return json.dumps({'success': False, 'error': str(e)}), 400, {'ContentType': 'application/json'}


def pauseSimJSON(user_path):
    try:
        flags_path = os.path.join(user_path, "flags")
        if not os.path.exists(flags_path):
            raise FileNotFoundError(f"Flags file not found at: {flags_path}")

        with open(flags_path, "r") as f:
            flags = f.read().splitlines()
        while len(flags) < 3:
            flags.append("False")

        stopSim = flags[0]
        pauseSim = flags[1] == "True"
        stepOnce = flags[2]

        # Toggle pauseSim
        pauseSim = not pauseSim
        pauses[user_path] = pauseSim

        with open(flags_path, "w") as f:
            f.write(f"{stopSim}\n{str(pauseSim)}\n{stepOnce}\n")

        print("Simulation paused:", pauseSim)
        return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}

    except Exception as e:
        print(f"Error in pauseSimJSON: {e}")
        return json.dumps({'success': False, 'error': str(e)}), 400, {'ContentType': 'application/json'}


def stopSimJSON(user_path):
    global simulation_process
    try:
        simulation_status[user_path] = False
        pauses[user_path] = False

        flags_path = os.path.join(user_path, "flags")
        inputs_path = os.path.join(user_path, api_file_map.FILE_MAP["inputs"])
        plant_inputs_path = os.path.join(user_path, api_file_map.FILE_MAP["plant_inputs"])

        with open(flags_path, "w") as f:
            f.write("False\nFalse\nFalse\n")  # stopSim, pauseSim, stepOnce
            f.close()

        for p in [inputs_path, plant_inputs_path]:
            open(p, 'w').close()

        if simulation_process.get(user_path) and simulation_process[user_path].poll() is None:
            parent = psutil.Process(simulation_process[user_path].pid)
            children = parent.children(recursive=True)
            for child in children:
                print(f"Killing child process {child.pid}")
                child.terminate()
            parent.terminate()

            gone, still_alive = psutil.wait_procs(children, timeout=5)
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


def stepOnceJSON(user_path):
    global simulation_process
    try:
        if not user_path.endswith('/'):
            user_path += '/'

        sim_path = os.path.join(user_path, "sim")
        flags_path = os.path.join(user_path, "flags")

        if not os.path.exists(sim_path):
            os.makedirs(sim_path)
            copytree("./sim", sim_path)

            poST_src = os.path.join(user_path, "poST_code.py")
            plant_src = os.path.join(user_path, "plant_code.py")

            if not os.path.exists(poST_src):
                raise FileNotFoundError(f"Missing: {poST_src}")
            if not os.path.exists(plant_src):
                raise FileNotFoundError(f"Missing: {plant_src}")

            shutil.copyfile(poST_src, os.path.join(sim_path, "poST_code.py"))
            shutil.copyfile(plant_src, os.path.join(sim_path, "plant_code.py"))

            print("Simulation directory initialized.")

        for filename in [api_file_map.FILE_MAP["inputs"], api_file_map.FILE_MAP["plant_inputs"]]:
            open(os.path.join(user_path, filename), 'w').close()

        # stopSim = True, pauseSim = True, stepOnce = True
        flags = ["True", "True", "True"]
        with open(flags_path, "w") as f:
            f.write("\n".join(flags) + "\n")
        print("Flags file initialized.")

        # Start simulation if not already running
        if user_path not in simulation_process or simulation_process[user_path] is None or simulation_process[user_path].poll() is not None:
            print("Simulation not running — starting it.")
            simulation_process[user_path] = subprocess.Popen(f"./startSim.sh {user_path}", shell=True)

        return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}

    except Exception as e:
        print(f"Error in stepOnceJSON: {e}")
        return json.dumps({'success': False, 'error': str(e)}), 400, {'ContentType': 'application/json'}


def changeTime(user_path):
    newTime = request.form["timeValue"]
    print(f"Received new scale: x{newTime}")

    with open(user_path + f"/{api_file_map.FILE_MAP['time_scale']}", "w") as f:
        f.write(newTime)
        f.close()

    return jsonify(success=True)