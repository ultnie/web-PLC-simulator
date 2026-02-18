(function () {
  "use strict";

  window.addEventListener("DOMContentLoaded", () => {
    const boot = window.__BOOTSTRAP__ || {};
    const AppState = window.AppState;

    if (typeof boot.sim === "boolean") AppState.sim = boot.sim;
    if (typeof boot.pause === "boolean") AppState.isPaused = boot.pause;
    if (boot.endpoints) AppState.endpoints = boot.endpoints;

    if (typeof window.initInputsUI === "function") {
      window.initInputsUI();
    }
  });
})();
