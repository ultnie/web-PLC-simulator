// static/js/forms/translateButton.js
(function () {
  "use strict";

  function syncEditorsToHiddenInputs() {
    const AppState = window.AppState;
    if (!AppState || !AppState.editors) return;

    const ed = AppState.editors;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val ?? "";
    };

    set("hidden-poST", ed.poST?.getValue());
    set("hidden-plant-poST", ed["plant-poST"]?.getValue());
    set("hidden-py", ed.py?.getValue());
    set("hidden-plant-py", ed["plant-py"]?.getValue());
  }

  window.addEventListener("DOMContentLoaded", () => {
    if (!window.jQuery) return;
    const $ = window.jQuery;

    $("#translateButton").on("click.translate", function (e) {
      e.preventDefault();

      const $btn = $(this);

      // Visual feedback
      $btn.prop("disabled", true);

      // Preserve original label so it survives rerenders/back button etc.
      const originalText = $btn.data("original-text") || $btn.text();
      $btn.data("original-text", originalText);
      $btn.text("Translating...");

      // Ensure Monaco content is submitted
      syncEditorsToHiddenInputs();

      // Ensure action=translate is present (in case default submit button isn't used)
      const $form = $("form").first();
      $form.find('input[name="action"][value="translate"]').remove(); // avoid duplicates
      $form.append(
        $("<input>", { type: "hidden", name: "action", value: "translate" })
      );

      $form.trigger("submit");
    });

    // Optional: if the user navigates back to the page, restore the button state
    $(window).on("pageshow.translate", function () {
      const $btn = $("#translateButton");
      const originalText = $btn.data("original-text");
      if (originalText) {
        $btn.prop("disabled", false).text(originalText);
      }
    });
  });

  // Optional export if you want to reuse syncing elsewhere
  window.syncEditorsToHiddenInputs = window.syncEditorsToHiddenInputs || syncEditorsToHiddenInputs;
})();
