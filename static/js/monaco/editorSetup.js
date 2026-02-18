// static/js/monaco/editorSetup.js
// Registers the custom "post" language + theme for Monaco.
// Usage (after Monaco is loaded):
//   setupPostLanguage(monaco);

(function () {
  "use strict";

  function setupPostLanguage(monaco) {
    if (!monaco) throw new Error("setupPostLanguage: monaco is required");

    try {
      if (monaco.languages.getLanguages().some(l => l.id === "post")) {
      } else {
        monaco.languages.register({ id: "post" });
      }
    } catch (_) {
      monaco.languages.register({ id: "post" });
    }

    monaco.languages.setMonarchTokensProvider("post", {
      defaultToken: "",
      keywords: [
        "CONFIGURATION", "END_CONFIGURATION",
        "PROGRAM", "END_PROGRAM",
        "VAR", "VAR_INPUT", "VAR_OUTPUT", "VAR_GLOBAL", "VAR_PROCESS", "END_VAR",
        "PROCESS", "END_PROCESS", "STATE", "END_STATE", "TIMEOUT", "END_TIMEOUT", "FUNCTION", "END_FUNCTION",
        "START", "STOP", "SET", "NEXT", "AND", "OR", "XOR",
        "IF", "THEN", "ELSIF", "ELSE", "END_IF", "CASE", "OF", "END_CASE",
        "FOR", "TO", "BY", "DO", "END_FOR", "WHILE", "END_WHILE",
        "REPEAT", "UNTIL", "END_REPEAT", "EXIT", "RETURN",
        "ACTIVE", "RESOURCE", "END_RESOURCE", "CONSTANT", "INTERVAL", "PRIORITY", "LOOPED", "WITH", "ON"
      ],
      typeKeywords: [
        "BOOL", "BYTE", "WORD", "DWORD", "INT", "DINT", "REAL", "LREAL",
        "TIME", "DATE", "TOD", "DT", "STRING", "ARRAY", "OF", "STRUCT", "END_STRUCT",
        "TRUE", "FALSE"
      ],
      operators: [
        "=", ">", "<", "!", "~", "?", ":", "==", "<=", ">=", "!=",
        "&&", "||", "++", "--", "+", "-", "*", "/", "&", "|", "^", "%",
        "<<", ">>", ">>>", "+=", "-=", "*=", "/=", "&=", "|=", "^=",
        "%=", "<<=", ">>=", ">>>=", ":", ":="
      ],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

      tokenizer: {
        root: [
          [
            /[a-zA-Z_]\w*/,
            {
              cases: {
                "@keywords": "keyword",
                "@typeKeywords": "type",
                "@default": "identifier"
              }
            }
          ],

          { include: "@whitespace" },

          [/[{}()\[\]]/, "@brackets"],
          [/[<>](?!@symbols)/, "@brackets"],

          [
            /@symbols/,
            {
              cases: {
                "@operators": "operator",
                "@default": ""
              }
            }
          ],

          [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
          [/0[xX][0-9a-fA-F]+/, "number.hex"],
          [/\d+/, "number"],
          [/[;,.]/, "delimiter"],

          [/"([^"\\]|\\.)*$/, "string.invalid"],
          [/"/, "string", "@string"],

          // Single-line comment
          [/\/\/.*$/, "comment"],

          // Block comments /* ... */
          [/\/\*/, "comment", "@comment"],

          // Pascal/F# style comment block (* ... *)
          [/\(\*/, "comment", "@parenComment"]
        ],

        whitespace: [
          [/[ \t\r\n]+/, "white"],
          [/\/\*/, "comment", "@comment"],
          [/\/\/.*$/, "comment"],
          [/\(\*/, "comment", "@parenComment"]
        ],

        comment: [
          [/[^\/*]+/, "comment"],
          [/\*\//, "comment", "@pop"],
          [/[\/*]/, "comment"]
        ],

        parenComment: [
          [/[^*()]+/, "comment"],
          [/\*\)/, "comment", "@pop"],
          [/[()*]/, "comment"]
        ],

        string: [
          [/[^\\"]+/, "string"],
          [/@escapes/, "string.escape"],
          [/\\./, "string.escape.invalid"],
          [/"/, "string", "@pop"]
        ]
      }
    });

    monaco.editor.defineTheme("post-theme", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "0000FF" },
        { token: "type", foreground: "267F99" },
        { token: "operator", foreground: "000000" },
        { token: "number", foreground: "098658" },
        { token: "string", foreground: "A31515" },
        { token: "comment", foreground: "008000" },
        { token: "parenComment", foreground: "008000" },
        { token: "identifier", foreground: "001080" },
        { token: "delimiter", foreground: "000000" }
      ],
      colors: {
        "editor.foreground": "#000000",
        "editor.background": "#FFFFFE",
        "editor.lineHighlightBackground": "#F5F5F5",
        "editorLineNumber.foreground": "#2B91AF",
        "editor.selectionBackground": "#ADD6FF",
        "editorCursor.foreground": "#000000"
      }
    });
  }

  window.setupPostLanguage = setupPostLanguage;
})();
