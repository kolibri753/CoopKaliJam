import js from "@eslint/js"
import globals from "globals"
import runePlugin from "rune-sdk/eslint.js"
import tseslint from "typescript-eslint"
import reactRefresh from "eslint-plugin-react-refresh"
import reactHooks from "eslint-plugin-react-hooks"

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  js.configs.recommended,
  ...runePlugin.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-refresh": reactRefresh,
      "react-hooks": reactHooks,
    },
    rules: {
      "react-refresh/only-export-components": "warn",
      ...reactHooks.configs.recommended.rules,
    },
  },
]
