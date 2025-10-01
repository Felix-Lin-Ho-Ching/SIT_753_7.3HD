const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: "latest", sourceType: "commonjs" },
    env: { node: true, jest: true },
    rules: { "no-unused-vars": ["warn", { "args": "none" }] }
  }
];
