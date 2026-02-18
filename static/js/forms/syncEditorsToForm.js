(function () {
  "use strict";

  function syncEditorsToHiddenInputs() {
    const AppState = window.AppState;
    if (!AppState || !AppState.editors) return;

    const editors = AppState.editors;

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value ?? "";
    };

    set("hidden-poST", editors.poST?.getValue());
    set("hidden-plant-poST", editors["plant-poST"]?.getValue());
    set("hidden-py", editors.py?.getValue());
    set("hidden-plant-py", editors["plant-py"]?.getValue());
  }

  window.addEventListener("DOMContentLoaded", () => {
    if (!window.jQuery) return;
    window.jQuery("form").on("submit", function () {
      syncEditorsToHiddenInputs();
    });
  });

  window.syncEditorsToHiddenInputs = syncEditorsToHiddenInputs;
})();
