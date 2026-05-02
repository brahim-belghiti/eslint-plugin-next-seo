import { createRule } from "../utils/create-rule";
import { findMetadataExport, findProperty } from "../utils/metadata";

export const requireMetadataTitle = createRule({
  name: "require-metadata-title",
  meta: {
    type: "problem",
    docs: {
      description:
        "Require that the Next.js `metadata` export includes a `title` property",
    },
    messages: {
      missingTitle: "Metadata export is missing a `title` property.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        const result = findMetadataExport(program);
        if (!result || !result.object) return;

        if (!findProperty(result.object, "title")) {
          context.report({
            node: result.exportNode,
            messageId: "missingTitle",
          });
        }
      },
    };
  },
});
