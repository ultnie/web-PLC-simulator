(function () {
  "use strict";

  function getEditors() {
    const AppState = window.AppState;
    return (AppState && AppState.editors) ? AppState.editors : {};
  }

  function applyFontSize(fontSize) {
    const lineHeight = Math.floor(fontSize * 1.4);

    const editors = getEditors();
    Object.values(editors).forEach((ed) => {
      if (!ed || typeof ed.updateOptions !== "function") return;
      ed.updateOptions({ fontSize, lineHeight });
    });

    localStorage.setItem("monacoFontSize", String(fontSize));
  }

  function clampSize(n) {
    const x = parseInt(n, 10);
    if (Number.isNaN(x)) return 14;
    return Math.min(36, Math.max(8, x));
  }

  function initFontSizeControls() {
    if (!window.jQuery) throw new Error("initFontSizeControls: jQuery missing");
    const $ = window.jQuery;

    const $input = $("#fontSizeInput");
    if (!$input.length) {
      console.warn("initFontSizeControls: #fontSizeInput not found");
      return;
    }

    const saved = clampSize(localStorage.getItem("monacoFontSize") || "14");
    $input.val(saved);

    applyFontSize(saved);

    $input.off(".fontSize");
    $("#fontSizeIncrease").off(".fontSize");
    $("#fontSizeDecrease").off(".fontSize");

    $input.on("change.fontSize input.fontSize", function () {
      const size = clampSize(this.value);
      this.value = size;
      applyFontSize(size);
    });

    $("#fontSizeIncrease").on("click.fontSize", function (e) {
      e.preventDefault();
      $input.val(clampSize(parseInt($input.val(), 10) + 1)).trigger("change");
    });

    $("#fontSizeDecrease").on("click.fontSize", function (e) {
      e.preventDefault();
      $input.val(clampSize(parseInt($input.val(), 10) - 1)).trigger("change");
    });
  }

  function applySavedFontSizeToEditors() {
    const saved = clampSize(localStorage.getItem("monacoFontSize") || "14");
    applyFontSize(saved);
  }

  window.initFontSizeControls = initFontSizeControls;
  window.applySavedFontSizeToEditors = applySavedFontSizeToEditors;
})();
