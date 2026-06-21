const tseslint = require("typescript-eslint");
const eslintConfigPrettier = require("eslint-config-prettier");

/** @type {import("eslint").Linter.Config[]} */
module.exports = tseslint.config(
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
);
