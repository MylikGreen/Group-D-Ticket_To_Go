const js = require("@eslint/js");
const globals = require("globals");

// Shared functions defined in js/main.js and used by the other page scripts
const sharedFromMain = {
  saveData: "readonly",
  loadData: "readonly",
  loadDecks: "readonly",
  saveDecks: "readonly",
  makeId: "readonly",
  DECKS_KEY: "readonly",
};

module.exports = [
  { ignores: ["node_modules/", "dist/", "js/config.js"] },
  js.configs.recommended,
  {
    // Pages load these as plain <script> tags (not modules), so files share globals
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: { ...globals.browser },
    },
    rules: {
      // Top-level functions in these files are used from other files/HTML
      "no-unused-vars": ["error", { vars: "local", args: "none" }],
    },
  },
  {
    files: ["js/decks.js", "js/study.js", "js/assistant.js"],
    languageOptions: { globals: sharedFromMain },
  },
  {
    files: ["js/config.example.js"],
    rules: { "no-unused-vars": "off" },
  },
];
