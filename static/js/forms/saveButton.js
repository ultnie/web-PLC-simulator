(function () {
  "use strict";

  function syncEditorsNow() {
    if (typeof window.syncEditorsToHiddenInputs === "function") {
      window.syncEditorsToHiddenInputs();
      return;
    }

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

  function popup(msg) {
    alert(msg);
  }

  window.addEventListener("DOMContentLoaded", () => {
    if (!window.jQuery) return;
    const $ = window.jQuery;

    const selector = "#savePoST, #savePoSTPlant";

    $(document).off("click.saveAJAX", selector).on("click.saveAJAX", selector, function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      syncEditorsNow();

      const poST_code = $("#hidden-poST").val() || $("#hidden-poST").text();
      const plant_poST_code = $("#hidden-plant-poST").val() || $("#hidden-plant-poST").text();


      const $btn = $(this);
      const originalText = $btn.data("original-text") || $btn.text();
      $btn.data("original-text", originalText);
      $btn.prop("disabled", true).text("Saving...");

      $.ajax({
        type: "POST",
        url: "/",
        dataType: "json",
        data: {
          action: "savePoST",
          poST_code: poST_code,
          plant_poST_code: plant_poST_code
        },
        success(res) {
          $btn.prop("disabled", false).text(originalText);

          if (res && res.success) {
            popup("Save successful");
          } else {
            popup(res?.error || "Save failed");
          }
        },
        error(xhr) {
          $btn.prop("disabled", false).text(originalText);

          // Most useful thing to print while debugging 400s:
          console.error("Save failed (status " + xhr.status + "):", xhr.responseText);

          const msg = xhr.responseJSON?.error || xhr.responseText || "Save failed";
          popup(msg);
        }
      });

      return false;
    });
  });
})();
