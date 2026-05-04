import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";
import { findMetadataExport, findProperty } from "../utils/metadata";

const DESCRIPTION_MAX = 160;

export const metadataDescriptionLength = createRule({
  name: "metadata-description-length",
  meta: {
    type: "suggestion",
    docs: {
      description: "Warn when metadata `description` exceeds 160 characters",
    },
    messages: {
      descriptionTooLong:
        "Metadata `description` is {{length}} characters; descriptions over 160 typically get truncated in search results.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        const result = findMetadataExport(program);
        if (!result || !result.object) return;

        const descProp = findProperty(result.object, "description");
        if (!descProp) return;

        const val = descProp.value;
        if (val.type !== AST_NODE_TYPES.Literal || typeof val.value !== "string") return;

        if (val.value.length > DESCRIPTION_MAX) {
          context.report({
            node: val,
            messageId: "descriptionTooLong",
            data: { length: val.value.length },
          });
        }
      },
    };
  },
});
