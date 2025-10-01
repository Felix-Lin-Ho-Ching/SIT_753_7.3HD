const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  { ignores: ["coverage/**", "reports/**", "node_modules/**"] },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: { ...globals.node, ...globals.jest }
    },
    rules: {
      "no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
      "no-empty": "off"
    }
  },
  {
    files: ["formValidation.js", "public/**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: { ...globals.browser }
    }
  }
];
