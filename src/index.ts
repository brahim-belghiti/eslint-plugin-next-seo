import type { TSESLint } from "@typescript-eslint/utils";
import { noEmptyMetadataFields } from "./rules/no-empty-metadata-fields";
import { noTemplateTitleOnPage } from "./rules/no-template-title-on-page";
import { ogImageInMetadata } from "./rules/og-image-in-metadata";
import { requireMetadataDescription } from "./rules/require-metadata-description";
import { requireMetadataTitle } from "./rules/require-metadata-title";
import { requireOpenGraph } from "./rules/require-open-graph";

const rules = {
  "require-metadata-title": requireMetadataTitle,
  "require-metadata-description": requireMetadataDescription,
  "require-open-graph": requireOpenGraph,
  "no-empty-metadata-fields": noEmptyMetadataFields,
  "no-template-title-on-page": noTemplateTitleOnPage,
  "og-image-in-metadata": ogImageInMetadata,
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
    "next-seo/no-empty-metadata-fields": "error",
    "next-seo/no-template-title-on-page": "error",
    "next-seo/og-image-in-metadata": "error",
  },
};

export default plugin;
