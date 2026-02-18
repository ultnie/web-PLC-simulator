// Simulation controls + output polling (Start/Stop/Pause/Step + updateButtonStates + timers)

(function () {
  "use strict";

  function formatNestedJson(obj, indent = 0) {
    let formatted = "";
    for (const [key, value] of Object.entries(obj || {})) {
      const spaces = " ".repeat(indent);
      if (typeof value === "object" && value !== null) {
        formatted += `${spaces}${key}:\n${formatNestedJson(value, indent + 2)}`;
      } else {
        formatted += `${spaces}${key}: ${value}\n`;
      }
    }
    return formatted;
  }

  function initSimulationControls() {
    if (!window.AppState) throw new Error("initSimulationControls: AppState missing (state.js not loaded?)");
    if (!window.jQuery) throw new Error("initSimulationControls: jQuery missing");

    const $ = window.jQuery;
    const AppState = window.AppState;
    const editors = AppState.editors;

    // Ensure endpoints exist (set from bootstrap or elsewhere)
    AppState.endpoints = AppState.endpoints || (window.__BOOTSTRAP__ && window.__BOOTSTRAP__.endpoints) || {};
    const endpoints = AppState.endpoints;

    // ------- internal polling state -------
    const MAX_RETRIES = 3;
    const MAX_EMPTY_RETRIES = 3;

    let outputsRetryCount = 0;
    let plantOutputsRetryCount = 0;
    let emptyOutputsCount = 0;
    let emptyPlantOutputsCount = 0;

    let updateOutputsTimeout = null;
    let updatePlantOutputsTimeout = null;

    function clearOutputTimeouts() {
      if (updateOutputsTimeout) clearTimeout(updateOutputsTimeout);
      if (updatePlantOutputsTimeout) clearTimeout(updatePlantOutputsTimeout);
      updateOutputsTimeout = null;
      updatePlantOutputsTimeout = null;
    }

    function getPyNonEmpty() {
      const py = editors.py;
      return !!(py && py.getValue().trim().length > 0);
    }

    function updateButtonStates() {
      const pyCodeNotEmpty = getPyNonEmpty();

      $("#startSimButton").prop("disabled", AppState.sim || !pyCodeNotEmpty);
      $("#stepSimButton").prop("disabled", !pyCodeNotEmpty);
      $("#pauseSimButton").prop("disabled", !AppState.sim);
      $("#stopSimButton").prop("disabled", !AppState.sim);
      $("#loadInputsButton").prop("disabled", !AppState.sim);
      $("#changeTimeButton").prop("disabled", !AppState.sim);

      $("#pauseSimButton").text(AppState.isPaused ? "Resume" : "Pause");
    }

    function updateOutputsOnce() {
      if (!AppState.sim) return;

      const outUrl = endpoints.outputs;
      const plantOutUrl = endpoints.plant_outputs;

      if (!outUrl || !plantOutUrl) {
        return;
      }

      // Controller outputs
      $.get(outUrl)
        .done(function (data) {
          try {
            if (data && typeof data === "object" && Object.keys(data).length > 0) {
              emptyOutputsCount = 0;
              outputsRetryCount = 0;
              $("#outputs").text(formatNestedJson(data));
            } else {
              emptyOutputsCount++;
              if (emptyOutputsCount >= MAX_EMPTY_RETRIES) return;
              updateOutputsTimeout = setTimeout(updateOutputsOnce, 1000);
            }
          } catch (e) {
            outputsRetryCount++;
            if (outputsRetryCount < MAX_RETRIES) updateOutputsTimeout = setTimeout(updateOutputsOnce, 1000);
          }
        })
        .fail(function () {
          outputsRetryCount++;
          if (outputsRetryCount < MAX_RETRIES) updateOutputsTimeout = setTimeout(updateOutputsOnce, 1000);
        });

      // Plant outputs
      $.get(plantOutUrl)
        .done(function (data) {
          try {
            if (data && typeof data === "object" && Object.keys(data).length > 0) {
              emptyPlantOutputsCount = 0;
              plantOutputsRetryCount = 0;
              $("#plant_outputs").text(formatNestedJson(data));
            } else {
              emptyPlantOutputsCount++;
              if (emptyPlantOutputsCount >= MAX_EMPTY_RETRIES) return;
              updatePlantOutputsTimeout = setTimeout(updateOutputsOnce, 1000);
            }
          } catch (e) {
            plantOutputsRetryCount++;
            if (plantOutputsRetryCount < MAX_RETRIES) updatePlantOutputsTimeout = setTimeout(updateOutputsOnce, 1000);
          }
        })
        .fail(function () {
          plantOutputsRetryCount++;
          if (plantOutputsRetryCount < MAX_RETRIES) updatePlantOutputsTimeout = setTimeout(updateOutputsOnce, 1000);
        });
    }

    function startPolling() {
      // reset counters
      outputsRetryCount = 0;
      plantOutputsRetryCount = 0;
      emptyOutputsCount = 0;
      emptyPlantOutputsCount = 0;

      clearOutputTimeouts();

      // clear existing interval if any
      if (AppState.outputsInterval) clearInterval(AppState.outputsInterval);
      AppState.outputsInterval = setInterval(updateOutputsOnce, 1000);

      // kick one immediate fetch
      updateOutputsOnce();

      // Optional: if you have extracted inputs modules, call them here
      if (typeof window.updateInputs === "function") window.updateInputs();
      if (typeof window.updatePlantInputs === "function") window.updatePlantInputs();
      if (typeof window.updateGlobals === "function") window.updateGlobals();
    }

    function stopPolling() {
      clearOutputTimeouts();
      if (AppState.outputsInterval) {
        clearInterval(AppState.outputsInterval);
        AppState.outputsInterval = null;
      }
    }

    function setSimState(simValue) {
      AppState.sim = !!simValue;

      if (!AppState.sim) {
        AppState.isPaused = false;
        stopPolling();
      } else {
        startPolling();
      }

      updateButtonStates();
    }

    window.updateSimButtons = updateButtonStates;
    window.setSimState = setSimState;

    function getEditorValuesToHiddenFields() {
      if (editors.poST) document.getElementById("hidden-poST").value = editors.poST.getValue();
      if (editors["plant-poST"]) document.getElementById("hidden-plant-poST").value = editors["plant-poST"].getValue();
      if (editors.py) document.getElementById("hidden-py").value = editors.py.getValue();
      if (editors["plant-py"]) document.getElementById("hidden-plant-py").value = editors["plant-py"].getValue();
    }

    // ------- button handlers -------
    $("#startSimButton").off("click.sim").on("click.sim", function (e) {
      e.preventDefault();
      getEditorValuesToHiddenFields();

      $.ajax({
        type: "POST",
        url: "/",
        dataType: "json",
        data: { action: "startSim" },
        success(res) {
          AppState.sim = !!res.sim;
          AppState.isPaused = !!res.paused;
          setSimState(res.sim);
        },
        error(xhr) {
          console.error("startSim failed:", xhr.responseJSON || xhr.responseText);
        }
      });
    });

    $("#stopSimButton").off("click.sim").on("click.sim", function (e) {
      e.preventDefault();

      $.ajax({
        type: "POST",
        url: "/",
        dataType: "json",
        data: { action: "stopSim" },
        success(res) {
          AppState.sim = !!res.sim;
          AppState.isPaused = !!res.paused;
          setSimState(res.sim);
        },
        error(xhr) {
          console.error("stopSim failed:", xhr.responseJSON || xhr.responseText);
        }
      });
    });

    $("#pauseSimButton").off("click.sim").on("click.sim", function (e) {
      e.preventDefault();

      $.ajax({
        type: "POST",
        url: "/",
        dataType: "json",
        data: { action: "pauseSim" },
        success(res) {
          AppState.isPaused = !!res.paused;
          updateButtonStates();
        },
        error(xhr) {
          console.error("pauseSim failed:", xhr.responseJSON || xhr.responseText);
        }
      });
    });

    $("#stepSimButton").off("click.sim").on("click.sim", function (e) {
      e.preventDefault();
      getEditorValuesToHiddenFields();

      $.ajax({
        type: "POST",
        url: "/",
        dataType: "json",
        data: { action: "stepSim" },
        success(res) {
          AppState.sim = !!res.sim;
          AppState.isPaused = !!res.paused;
          setSimState(res.sim);
          updateButtonStates();
        },
        error(xhr) {
          console.error("stepSim failed:", xhr.responseJSON || xhr.responseText);
        }
      });
    });

    $("#changeTimeButton").off("click.sim").on("click.sim", function (e) {
      e.preventDefault();
      const timeValue = $("#time").val();

      $.ajax({
        type: "POST",
        url: "/",
        dataType: "json",
        data: { action: "changeTime", timeValue },
        success() {},
        error(xhr) {
          console.error("changeTime failed:", xhr.responseJSON || xhr.responseText);
        }
      });
    });

    // Keep buttons reactive to python editor changes
    if (editors.py && typeof editors.py.onDidChangeModelContent === "function") {
      editors.py.onDidChangeModelContent(updateButtonStates);
    }

    // Initial button state + if page loads with sim already running
    updateButtonStates();
    if (AppState.sim) {
      startPolling();
    }
  }

  window.initSimulationControls = initSimulationControls;
})();
