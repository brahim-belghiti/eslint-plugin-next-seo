import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";
import { findMetadataExport, findProperty } from "../utils/metadata";

function isRelativeUrl(value: string): boolean {
  return !value.startsWith("//") && !value.includes("://");
}

function findRelativeImageUrl(
  images: TSESTree.ArrayExpression,
): { node: TSESTree.Node; url: string } | null {
  for (const element of images.elements) {
    if (!element) continue;

    if (element.type === AST_NODE_TYPES.Literal && typeof element.value === "string") {
      if (isRelativeUrl(element.value)) {
        return { node: element, url: element.value };
      }
    }

    if (element.type === AST_NODE_TYPES.ObjectExpression) {
      const urlProp = findProperty(element, "url");
      if (!urlProp) continue;
      const val = urlProp.value;
      if (val.type === AST_NODE_TYPES.Literal && typeof val.value === "string") {
        if (isRelativeUrl(val.value)) {
          return { node: val, url: val.value };
        }
      }
    }
  }
  return null;
}

export const metadataBaseRequiredForRelativeOgImages = createRule({
  name: "metadata-base-required-for-relative-og-images",
  meta: {
    type: "problem",
    docs: {
      description:
        "Require `metadataBase` when `openGraph.images` contains relative URLs",
    },
    messages: {
      relativeOgImageWithoutMetadataBase:
        "`openGraph.images` contains a relative URL (`{{url}}`); set `metadataBase` so Next.js can resolve it to an absolute URL.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        const result = findMetadataExport(program);
        if (!result || !result.object) return;

        const ogProp = findProperty(result.object, "openGraph");
        if (!ogProp) return;
        if (ogProp.value.type !== AST_NODE_TYPES.ObjectExpression) return;

        const imagesProp = findProperty(ogProp.value, "images");
        if (!imagesProp) return;
        if (imagesProp.value.type !== AST_NODE_TYPES.ArrayExpression) return;

        const relative = findRelativeImageUrl(imagesProp.value);
        if (!relative) return;

        const metadataBase = findProperty(result.object, "metadataBase");
        if (metadataBase) return;

        context.report({
          node: relative.node,
          messageId: "relativeOgImageWithoutMetadataBase",
          data: { url: relative.url },
        });
      },
    };
  },
});
