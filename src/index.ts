import type { TSESLint } from "@typescript-eslint/utils";
import { requireMetadataTitle } from "./rules/require-metadata-title";

const rules = {
  "require-metadata-title": requireMetadataTitle,
};

const plugin = {
  meta: {
    name: "eslint-plugin-next-seo",
    version: "0.0.1",
  },
  rules,
  configs: {} as Record<string, TSESLint.FlatConfig.Config>,
};

plugin.configs.recommended = {
  plugins: {
    "next-seo": plugin,
  },
  rules: {
    "next-seo/require-metadata-title": "error",
  },
};

export default plugin;
