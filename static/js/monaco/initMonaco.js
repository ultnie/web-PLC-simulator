// static/js/monaco/initMonaco.js
// Boots Monaco creates editors

(function () {
  "use strict";

  function getBootstrap() {
    const boot = window.__BOOTSTRAP__;
    if (!boot) {
      throw new Error("initMonaco: window.__BOOTSTRAP__ is missing (inline bootstrap not loaded?)");
    }
    return boot;
  }

  function ensurePrereqs() {
    if (!window.require || !window.require.config) {
      throw new Error("initMonaco: require.js loader is not available (is Monaco loader.js included?)");
    }
    if (!window.setupPostLanguage) {
      throw new Error("initMonaco: setupPostLanguage() not found (editorSetup.js not loaded?)");
    }
    if (!window.createEditors) {
      throw new Error("initMonaco: createEditors() not found (editorFactory.js not loaded?)");
    }
    if (!window.AppState) {
      throw new Error("initMonaco: window.AppState not found (state.js not loaded?)");
    }
  }

  function normalizeCode(boot) {
    // Support either boot.code.* or direct keys (in case you name them differently)
    const code = boot.code || boot;
    return {
      poST: code.poST ?? code.poST_code ?? "",
      plantPoST: code.plantPoST ?? code.plant_poST_code ?? "",
      py: code.py ?? code.Py_code ?? "",
      plantPy: code.plantPy ?? code.plant_Py_code ?? ""
    };
  }

  function initMonaco() {
    ensurePrereqs();

    const boot = getBootstrap();
    const AppState = window.AppState;

    // Initialize state from bootstrap (authoritative initial render)
    if (typeof boot.sim === "boolean") AppState.sim = boot.sim;
    if (typeof boot.pause === "boolean") AppState.isPaused = boot.pause;

    // Store endpoints for other modules (polling/inputs/sim)
    if (boot.endpoints && typeof boot.endpoints === "object") {
      AppState.endpoints = boot.endpoints;
    }

    // Configure Monaco loader path
    window.require.config({
      paths: {
        vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs"
      }
    });

    // Load Monaco core and build editors
    window.require(["vs/editor/editor.main"], function () {
      // Register the language + theme
      window.setupPostLanguage(window.monaco);

      // Create editors with initial values from bootstrap
      window.createEditors(normalizeCode(boot));

      // Kick off other init hooks if present
      if (typeof window.initFontSizeControls === "function") {
        window.initFontSizeControls();
      }

      if (window.applySavedFontSizeToEditors) {
        window.applySavedFontSizeToEditors();
      }

      if (typeof window.initSimulationControls === "function") {
        window.initSimulationControls();
      }

      // Layout on tab switches if you still use Bootstrap tabs
      // (Safe even if jQuery isn't present; guarded.)
      if (window.jQuery) {
        window.jQuery('a[data-toggle="tab"]').on("shown.bs.tab", function () {
          const editors = window.AppState?.editors || {};
          Object.values(editors).forEach(ed => ed && ed.layout && ed.layout());
        });
      }
    });
  }

  // Initialize once DOM is ready (editors need container elements)
  window.addEventListener("DOMContentLoaded", initMonaco);

  // Expose for manual triggering (optional)
  window.initMonaco = initMonaco;
})();
