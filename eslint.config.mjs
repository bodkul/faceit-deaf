import path from "node:path";

import { includeIgnoreFile } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import arrayFunc from "eslint-plugin-array-func";
import prettierConfigRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import ts from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

const eslintConfig = [
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "array-func": arrayFunc,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "array-func/from-map": "error",
    },
  },
  includeIgnoreFile(gitignorePath),
  prettierConfigRecommended,
  ...ts.configs.recommended,
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
