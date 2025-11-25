import path from "node:path";

import { includeIgnoreFile } from "@eslint/compat";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import arrayFunc from "eslint-plugin-array-func";
import prettierConfigRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import ts from "typescript-eslint";

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
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
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
