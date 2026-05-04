import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";
import { findMetadataExport, findProperty } from "../utils/metadata";

const TITLE_MAX = 60;

export const metadataTitleLength = createRule({
  name: "metadata-title-length",
  meta: {
    type: "suggestion",
    docs: {
      description: "Warn when metadata `title` exceeds 60 characters",
    },
    messages: {
      titleTooLong:
        "Metadata `title` is {{length}} characters; titles over 60 typically get truncated in search results.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        const result = findMetadataExport(program);
        if (!result || !result.object) return;

        const titleProp = findProperty(result.object, "title");
        if (!titleProp) return;

        const val = titleProp.value;

        if (val.type === AST_NODE_TYPES.Literal && typeof val.value === "string") {
          if (val.value.length > TITLE_MAX) {
            context.report({
              node: val,
              messageId: "titleTooLong",
              data: { length: val.value.length },
            });
          }
          return;
        }

        if (val.type === AST_NODE_TYPES.ObjectExpression) {
          for (const key of ["default", "absolute"] as const) {
            const sub = findProperty(val, key);
            if (!sub) continue;
            const subVal = sub.value;
            if (
              subVal.type === AST_NODE_TYPES.Literal &&
              typeof subVal.value === "string" &&
              subVal.value.length > TITLE_MAX
            ) {
              context.report({
                node: subVal,
                messageId: "titleTooLong",
                data: { length: subVal.value.length },
              });
            }
          }
        }
      },
    };
  },
});
