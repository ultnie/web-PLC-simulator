from flask import render_template, session
import visualization_ports


def render_index(poST_code, plant_code, Py_code, plant_Py_code, out, plant_out, path, sim, pause):
    session_id = str(session['user']) if 'user' in session else ""

    base_params = dict(
        poST_code=poST_code,
        plant_poST_code=plant_code,
        Py_code=Py_code,
        plant_Py_code=plant_Py_code,
        out=out,
        plant_out=plant_out,
        session=session_id,
        outputs=path + "control_outputs",
        plant_outputs=path + "plant_outputs",
        inputs=path + "control_inputs",
        plant_inputs=path + "plant_inputs",
        globals=path + "control_global_vars",
        sim=str(sim).lower(),
        pause=str(pause).lower(),
        editor=visualization_ports.editor_port,
        viewer=visualization_ports.viewer_port,
    )


    if sim:
        base_params['disable_start'] = "disabled"
    elif Py_code is not None:
        base_params.update(disable_inputs="disabled", disable_stop="disabled", disable_pause="disabled")
    elif out is not None:
        base_params.update(disable_pause="disabled", disable_Py="disabled", disable_inputs="disabled", disable_start="disabled", disable_stop="disabled")
    elif poST_code is not None:
        base_params.update(disable_Py="disabled", disable_pause="disabled", disable_inputs="disabled", disable_start="disabled", disable_stop="disabled")
    else:
        base_params.update(disable_poST="disabled", disable_Py="disabled", disable_pause="disabled", disable_inputs="disabled", disable_start="disabled", disable_stop="disabled")

    return render_template("index.html", **base_params)