// static/js/monaco/editorFactory.js
// Responsible ONLY for creating Monaco editor instances
// Usage:
//   createEditors({
//     poST: "...",
//     plantPoST: "...",
//     py: "...",
//     plantPy: "..."
//   });

(function () {
  "use strict";

  function createEditors(initialValues) {
    if (!window.monaco) {
      throw new Error("createEditors: Monaco is not loaded");
    }

    const AppState = window.AppState;
    const editors = AppState.editors;

    const fontSize = parseInt(localStorage.getItem("monacoFontSize"), 10) || 14;
    const lineHeight = Math.floor(fontSize * 1.4);

    const commonPostOptions = {
      language: "post",
      theme: "post-theme",
      automaticLayout: true,
      lineNumbers: "on",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize,
      lineHeight,
      folding: true,
      wordWrap: "on",
      formatOnPaste: true,
      formatOnType: true,
      renderWhitespace: "none",
      scrollbar: {
        vertical: "auto",
        horizontal: "auto",
        useShadows: true
      }
    };

    const commonPyOptions = {
      language: "python",
      theme: "vs",
      automaticLayout: true,
      readOnly: true,
      lineNumbers: "on",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize,
      lineHeight,
      renderWhitespace: "none"
    };

    // ---- poST controller ----
    editors.poST = monaco.editor.create(
      document.getElementById("editor-poST"),
      Object.assign(
        {
          value: initialValues.poST || ""
        },
        commonPostOptions
      )
    );

    // ---- poST plant ----
    editors["plant-poST"] = monaco.editor.create(
      document.getElementById("editor-plant-poST"),
      Object.assign(
        {
          value: initialValues.plantPoST || ""
        },
        commonPostOptions
      )
    );

    // ---- Python controller ----
    editors.py = monaco.editor.create(
      document.getElementById("editor-py"),
      Object.assign(
        {
          value: initialValues.py || ""
        },
        commonPyOptions
      )
    );

    // ---- Python plant ----
    editors["plant-py"] = monaco.editor.create(
      document.getElementById("editor-plant-py"),
      Object.assign(
        {
          value: initialValues.plantPy || ""
        },
        commonPyOptions
      )
    );

    setTimeout(() => {
      Object.values(editors).forEach(editor => {
        if (editor && typeof editor.layout === "function") {
          editor.layout();
        }
      });
    }, 100);
  }

  window.createEditors = createEditors;
})();
