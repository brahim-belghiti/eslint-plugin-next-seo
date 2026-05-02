import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";
import { findMetadataExport, findProperty } from "../utils/metadata";

export const ogImageInMetadata = createRule({
  name: "og-image-in-metadata",
  meta: {
    type: "problem",
    docs: {
      description: "Require `openGraph.images` when `openGraph` is set",
    },
    messages: {
      missingOgImages:
        "`openGraph` should include `images` for social link previews.",
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

        if (!findProperty(ogProp.value, "images")) {
          context.report({
            node: ogProp,
            messageId: "missingOgImages",
          });
        }
      },
    };
  },
});
