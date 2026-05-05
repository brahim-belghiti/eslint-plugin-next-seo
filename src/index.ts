import type { TSESLint } from "@typescript-eslint/utils";
import { metadataBaseRequiredForRelativeOgImages } from "./rules/metadata-base-required-for-relative-og-images";
import { metadataDescriptionLength } from "./rules/metadata-description-length";
import { metadataKeywordsShape } from "./rules/metadata-keywords-shape";
import { metadataTitleLength } from "./rules/metadata-title-length";
import { noEmptyMetadataFields } from "./rules/no-empty-metadata-fields";
import { noMetadataInClientComponent } from "./rules/no-metadata-in-client-component";
import { noTemplateTitleOnPage } from "./rules/no-template-title-on-page";
import { ogImageInMetadata } from "./rules/og-image-in-metadata";
import { requireMetadataDescription } from "./rules/require-metadata-description";
import { requireMetadataTitle } from "./rules/require-metadata-title";
import { requireOpenGraph } from "./rules/require-open-graph";
import { singleH1PerPage } from "./rules/single-h1-per-page";
import { validJsonldFields } from "./rules/valid-jsonld-fields";
import { validJsonldType } from "./rules/valid-jsonld-type";
import { validOpenGraphType } from "./rules/valid-openGraph-type";
import { validSitemapShape } from "./rules/valid-sitemap-shape";
import { validTwitterCard } from "./rules/valid-twitter-card";

const rules = {
  "require-metadata-title": requireMetadataTitle,
  "require-metadata-description": requireMetadataDescription,
  "require-open-graph": requireOpenGraph,
  "no-empty-metadata-fields": noEmptyMetadataFields,
  "no-template-title-on-page": noTemplateTitleOnPage,
  "og-image-in-metadata": ogImageInMetadata,
  "metadata-title-length": metadataTitleLength,
  "metadata-description-length": metadataDescriptionLength,
  "valid-twitter-card": validTwitterCard,
  "valid-openGraph-type": validOpenGraphType,
  "metadata-keywords-shape": metadataKeywordsShape,
  "metadata-base-required-for-relative-og-images": metadataBaseRequiredForRelativeOgImages,
  "no-metadata-in-client-component": noMetadataInClientComponent,
  "valid-sitemap-shape": validSitemapShape,
  "valid-jsonld-type": validJsonldType,
  "valid-jsonld-fields": validJsonldFields,
  "single-h1-per-page": singleH1PerPage,
};

const plugin = {
  meta: {
    name: "eslint-plugin-next-seo",
    version: "0.8.0",
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
    "next-seo/metadata-title-length": "warn",
    "next-seo/metadata-description-length": "warn",
    "next-seo/valid-twitter-card": "error",
    "next-seo/valid-openGraph-type": "error",
    "next-seo/metadata-keywords-shape": "error",
    "next-seo/metadata-base-required-for-relative-og-images": "error",
    "next-seo/no-metadata-in-client-component": "error",
    "next-seo/valid-sitemap-shape": "error",
    "next-seo/valid-jsonld-type": "error",
    "next-seo/valid-jsonld-fields": "warn",
    "next-seo/single-h1-per-page": "error",
  },
};

export default plugin;
