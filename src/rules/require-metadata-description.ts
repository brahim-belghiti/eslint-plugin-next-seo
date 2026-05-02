import { createRule } from "../utils/create-rule";
import { findMetadataExport, findProperty } from "../utils/metadata";

export const requireMetadataDescription = createRule({
  name: "require-metadata-description",
  meta: {
    type: "problem",
    docs: {
      description:
        "Require that the Next.js `metadata` export includes a `description` property",
    },
    messages: {
      missingDescription: "Metadata export is missing a `description` property.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        const result = findMetadataExport(program);
        if (!result || !result.object) return;

        if (!findProperty(result.object, "description")) {
          context.report({
            node: result.exportNode,
            messageId: "missingDescription",
          });
        }
      },
    };
  },
});
