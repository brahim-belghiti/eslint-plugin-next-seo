import type { TSESLint } from "@typescript-eslint/utils";
import { requireMetadataDescription } from "./rules/require-metadata-description";
import { requireMetadataTitle } from "./rules/require-metadata-title";
import { requireOpenGraph } from "./rules/require-open-graph";

const rules = {
  "require-metadata-title": requireMetadataTitle,
  "require-metadata-description": requireMetadataDescription,
  "require-open-graph": requireOpenGraph,
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
    "next-seo/require-metadata-description": "error",
    "next-seo/require-open-graph": "error",
  },
};

export default plugin;
