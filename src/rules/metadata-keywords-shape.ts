import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";
import { findMetadataExport, findProperty } from "../utils/metadata";

export const metadataKeywordsShape = createRule({
  name: "metadata-keywords-shape",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce `keywords` is an array, not a string",
    },
    messages: {
      stringKeywords:
        "Metadata `keywords` should be an array of strings, not a single string. Comma-separated keyword strings are deprecated SEO advice.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        const result = findMetadataExport(program);
        if (!result || !result.object) return;

        const kwProp = findProperty(result.object, "keywords");
        if (!kwProp) return;

        const val = kwProp.value;
        if (val.type === AST_NODE_TYPES.Literal && typeof val.value === "string") {
          context.report({ node: val, messageId: "stringKeywords" });
        }
      },
    };
  },
});
