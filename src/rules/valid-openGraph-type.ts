import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";
import { findMetadataExport, findProperty } from "../utils/metadata";
import { OG_TYPES } from "../utils/og-types";

export const validOpenGraphType = createRule({
  name: "valid-openGraph-type",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce valid `openGraph.type` values",
    },
    messages: {
      unknownOgType:
        "Open Graph `type` `{{value}}` is not a valid Open Graph type.",
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

        const typeProp = findProperty(ogProp.value, "type");
        if (!typeProp) return;

        const val = typeProp.value;
        if (val.type !== AST_NODE_TYPES.Literal || typeof val.value !== "string") return;

        if (!OG_TYPES.has(val.value)) {
          context.report({
            node: val,
            messageId: "unknownOgType",
            data: { value: val.value },
          });
        }
      },
    };
  },
});
