import { FlatCompat } from "@eslint/eslintrc";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import prettierPlugin from "eslint-plugin-prettier";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import nextPlugin from "@next/eslint-plugin-next/dist/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import securityPlugin from "eslint-plugin-security";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: ["lib/generated/**", "lib/**/generated/**"] },
  ...compat.extends("plugin:@next/next/recommended"),
  ...compat.extends("plugin:react/recommended"),
  ...compat.extends("plugin:jsx-a11y/recommended"),
  ...compat.extends("plugin:prettier/recommended"),
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      react: reactPlugin,
      prettier: prettierPlugin,
      "jsx-a11y": jsxA11yPlugin,
      next: nextPlugin,
      security: securityPlugin,
    },
    rules: {
      // Code style
      "no-console": "error",
      "jsx-a11y/aria-props": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "no-unused-vars": "off",
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": "warn",
      // Basic security
      "security/detect-buffer-noassert": "warn",
      "security/detect-child-process": "warn",
      "security/detect-disable-mustache-escape": "warn",
      "security/detect-eval-with-expression": "error",
      "security/detect-new-buffer": "warn",
      "security/detect-no-csrf-before-method-override": "warn",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-object-injection": "warn",
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "warn",
      "security/detect-unsafe-regex": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];

export default eslintConfig;
