import path from "node:path";
import js from "@eslint/js";
import ts from "typescript-eslint";
import prettierConfigRecommended from "eslint-plugin-prettier/recommended";
import { FlatCompat } from "@eslint/eslintrc";
import { includeIgnoreFile } from "@eslint/compat";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

const eslintConfig = [
  includeIgnoreFile(gitignorePath),
  prettierConfigRecommended,
  ...ts.configs.recommended,
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
