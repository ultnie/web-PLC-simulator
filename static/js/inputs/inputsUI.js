(function () {
  "use strict";

  function initInputsUI() {
    if (!window.AppState) throw new Error("initInputsUI: AppState missing");
    if (!window.jQuery) throw new Error("initInputsUI: jQuery missing");

    const $ = window.jQuery;
    const AppState = window.AppState;

    AppState.endpoints = AppState.endpoints || (window.__BOOTSTRAP__ && window.__BOOTSTRAP__.endpoints) || {};
    const endpoints = AppState.endpoints;

    const boot = window.__BOOTSTRAP__ || {};
    const sessionId = boot.session || "";

    // ---------- Retry / load state ----------
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000;

    let inputsLoaded = false;
    let plantInputsLoaded = false;
    let globalsLoaded = false;

    let inputsRetryCount = 0;
    let plantInputsRetryCount = 0;
    let globalsRetryCount = 0;

    let updateInputsTimeout = null;
    let updatePlantInputsTimeout = null;
    let updateGlobalsTimeout = null;

    function clearAllTimeouts() {
      if (updateInputsTimeout) clearTimeout(updateInputsTimeout);
      if (updatePlantInputsTimeout) clearTimeout(updatePlantInputsTimeout);
      if (updateGlobalsTimeout) clearTimeout(updateGlobalsTimeout);
      updateInputsTimeout = null;
      updatePlantInputsTimeout = null;
      updateGlobalsTimeout = null;
    }

    function scheduleRetry(type) {
      switch (type) {
        case "inputs":
          inputsRetryCount++;
          if (inputsRetryCount < MAX_RETRIES) {
            updateInputsTimeout = setTimeout(updateInputs, RETRY_DELAY_MS);
          }
          break;
        case "plantInputs":
          plantInputsRetryCount++;
          if (plantInputsRetryCount < MAX_RETRIES) {
            updatePlantInputsTimeout = setTimeout(updatePlantInputs, RETRY_DELAY_MS);
          }
          break;
        case "globals":
          globalsRetryCount++;
          if (globalsRetryCount < MAX_RETRIES) {
            updateGlobalsTimeout = setTimeout(updateGlobals, RETRY_DELAY_MS);
          }
          break;
      }
    }

    // ---------- UI helpers ----------
    function makeMasterToggle(targetSelector) {
      return $("<li/>")
        .addClass("ui-menu-item master-toggle")
        .append(
          $("<label/>").append(
            $("<input/>", {
              type: "checkbox",
              class: "toggle-all",
              "data-target": targetSelector
            }),
            " Select all"
          )
        );
    }

    function makeSearchRow(targetSelector) {
      return $("<li/>")
        .addClass("ui-menu-item search-row")
        .append(
          $("<input/>", {
            type: "text",
            class: "list-search",
            placeholder: "Search inputs…",
            "data-target": targetSelector
          })
        );
    }

    function refreshToggleAllForMenu(menuSelector) {
      const menu = window.jQuery(menuSelector);
      if (!menu.length) return;

      const visibleFlags = menu.find("li:visible .send-flag");
      const checkedVisible = visibleFlags.filter(":checked").length;

      const toggleAll = window.jQuery(`.toggle-all[data-target="${menuSelector}"]`);
      if (!toggleAll.length) return;

      // If there are no visible items, show unchecked + not indeterminate
      if (visibleFlags.length === 0) {
        toggleAll.prop({ checked: false, indeterminate: false });
        return;
      }

      toggleAll.prop({
        checked: checkedVisible === visibleFlags.length,
        indeterminate: checkedVisible > 0 && checkedVisible < visibleFlags.length
      });
    }


    function makeInputControl(key, value) {
      let input;

      if (typeof value === "boolean") {
        input = $("<input/>", { type: "checkbox", checked: value });
      } else if (typeof value === "number") {
        input = $("<input/>", {
          type: "number",
          step: "any",
          value: value,
          inputmode: "decimal"
        });
      } else {
        input = $("<input/>", {
          type: "text",
          value: value
        });
      }

      input
        .addClass("ui-all value-input")
        .attr("name", key)
        .prop("disabled", true);

      return input;
    }

    function renderInputsList(menuSelector, dataObj) {
      const menu = $(menuSelector);
      menu.empty();

      menu.append(makeMasterToggle(menuSelector));
      menu.append(makeSearchRow(menuSelector));

      $.each(dataObj, function (key, value) {
        if (Array.isArray(value)) return;

        const li = $("<li/>")
          .addClass("ui-menu-item")
          .attr("role", "menuitem");

        const sendCheckbox = $("<input/>", {
          type: "checkbox",
          class: "send-flag",
          checked: false
        });

        const input = makeInputControl(key, value);

        const label = $("<label/>")
          .addClass("ui-all")
          .text(key)
          .data("original-text", key);

        li.append(sendCheckbox, input, label);
        menu.append(li);
      });
    }


    $(document).off("change.inputs", ".send-flag").on("change.inputs", ".send-flag", function () {
      $(this).closest("li").find(".value-input").prop("disabled", !this.checked);

      const menu = $(this).closest("ul");
      const visibleFlags = menu.find("li:visible .send-flag");
      const checkedVisible = visibleFlags.filter(":checked").length;

      const toggleAll = $(`.toggle-all[data-target="#${menu.attr("id")}"]`);
      if (!toggleAll.length || visibleFlags.length === 0) return;

      toggleAll.prop({
        checked: checkedVisible === visibleFlags.length,
        indeterminate: checkedVisible > 0 && checkedVisible < visibleFlags.length
      });
    });

    $(document).off("change.inputs", ".toggle-all").on("change.inputs", ".toggle-all", function () {
      const target = $(this).data("target");
      const checked = this.checked;

      $(`${target} li:visible .send-flag`).prop("checked", checked).trigger("change");
      refreshToggleAllForMenu(target);
    });

    $(document).off("input.inputs", ".list-search").on("input.inputs", ".list-search", function () {
      let query = ($(this).val() || "").toLowerCase();
      const target = $(this).data("target"); // like "#assetNameMenu"
      const menu = $(target);

      menu.find("li").each(function () {
        const li = $(this);

        if (li.hasClass("master-toggle") || li.hasClass("search-row")) return;

        const label = li.find("label");
        const original = label.data("original-text");
        if (!original) return;

        if (query === "") {
          label.text(original);
          li.show();
          return;
        }

        const lower = original.toLowerCase();
        const pos = lower.indexOf(query);

        if (pos === -1) {
          li.hide();
          return;
        }

        const before = original.substring(0, pos);
        const match = original.substring(pos, pos + query.length);
        const after = original.substring(pos + query.length);

        label.html(`${before}<span class="label-highlight">${match}</span>${after}`);
        li.show();
      });

      refreshToggleAllForMenu(target);
    });


    // ---------- Load from server ----------
    function updateInputs() {
      // Only fetch while sim is running
      if (!AppState.sim) return;

      if (inputsLoaded || inputsRetryCount >= MAX_RETRIES) return;
      if (!endpoints.inputs) return;

      $.get(endpoints.inputs)
        .done(function (data) {
          if (data && typeof data === "object" && Object.keys(data).length > 0) {
            inputsLoaded = true;
            inputsRetryCount = 0;
            renderInputsList("#assetNameMenu", data);
          } else {
            scheduleRetry("inputs");
          }
        })
        .fail(function () {
          scheduleRetry("inputs");
        });
    }

    function updatePlantInputs() {
      if (!AppState.sim) return;

      if (plantInputsLoaded || plantInputsRetryCount >= MAX_RETRIES) return;
      if (!endpoints.plant_inputs) return;

      $.get(endpoints.plant_inputs)
        .done(function (data) {
          if (data && typeof data === "object" && Object.keys(data).length > 0) {
            plantInputsLoaded = true;
            plantInputsRetryCount = 0;
            renderInputsList("#plant_assetNameMenu", data);
          } else {
            scheduleRetry("plantInputs");
          }
        })
        .fail(function () {
          scheduleRetry("plantInputs");
        });
    }

    function updateGlobals() {
      if (!AppState.sim) return;

      if (globalsLoaded || globalsRetryCount >= MAX_RETRIES) return;
      if (!endpoints.globals) return;

      $.get(endpoints.globals)
        .done(function (data) {
          if (data && typeof data === "object" && Object.keys(data).length > 0) {
            globalsLoaded = true;
            globalsRetryCount = 0;
            renderInputsList("#globals_assetNameMenu", data);
          } else {
            scheduleRetry("globals");
          }
        })
        .fail(function () {
          scheduleRetry("globals");
        });
    }

    // simControls calls these when sim starts
    window.updateInputs = updateInputs;
    window.updatePlantInputs = updatePlantInputs;
    window.updateGlobals = updateGlobals;

    // ---------- Sending selected inputs ----------
    function collectInputs(menuSelector) {
      const result = {};

      $(`${menuSelector} li`).each(function () {
        const send = $(this).find(".send-flag").is(":checked");
        if (!send) return;

        const input = $(this).find(".value-input");
        const name = input.attr("name");
        const type = input.attr("type");

        const value =
          type === "checkbox"
            ? input.is(":checked")
            : type === "number"
            ? parseFloat(input.val())
            : input.val();

        result[name] = value;
      });

      return result;
    }

    $("#loadInputsButton").off("click.inputs").on("click.inputs", function (e) {
      e.preventDefault();

      const inputs = collectInputs("#assetNameMenu");
      const plant_inputs = collectInputs("#plant_assetNameMenu");
      const global_inputs = collectInputs("#globals_assetNameMenu");

      const formData = new FormData();
      formData.append("action", "loadInputs");
      formData.append("inputs", JSON.stringify(inputs));
      formData.append("plant_inputs", JSON.stringify(plant_inputs));
      formData.append("global_inputs", JSON.stringify(global_inputs));

      const url = boot.loadInputsUrl || (sessionId ? `/sessions/${sessionId}/load_inputs` : "/sessions//load_inputs");

      $.ajax({
        type: "POST",
        url: url,
        processData: false,
        contentType: false,
        data: formData,
        success: function () {
          inputsLoaded = false;
          plantInputsLoaded = false;
          globalsLoaded = false;

          clearAllTimeouts();
          updateInputs();
          updatePlantInputs();
          updateGlobals();
        },
        error: function (xhr) {
          console.error("load_inputs failed:", xhr.responseJSON || xhr.responseText);
        }
      });
    });

    // If the page loads with sim already running, load immediately.
    // Otherwise simControls will call updateInputs* when sim starts.
    if (AppState.sim) {
      updateInputs();
      updatePlantInputs();
      updateGlobals();
    }
  }

  window.initInputsUI = initInputsUI;
})();
