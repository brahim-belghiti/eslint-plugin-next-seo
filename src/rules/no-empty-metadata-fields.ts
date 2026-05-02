import { createRule } from "../utils/create-rule";
import {
  findMetadataExport,
  findProperty,
  isEmptyString,
} from "../utils/metadata";

const FIELDS = ["title", "description"] as const;

export const noEmptyMetadataFields = createRule({
  name: "no-empty-metadata-fields",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow empty string values in `metadata` fields like `title` and `description`",
    },
    messages: {
      emptyField: "Metadata `{{field}}` must not be an empty string.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        const result = findMetadataExport(program);
        if (!result || !result.object) return;

        for (const field of FIELDS) {
          const prop = findProperty(result.object, field);
          if (!prop) continue;
          if (isEmptyString(prop.value)) {
            context.report({
              node: prop.value,
              messageId: "emptyField",
              data: { field },
            });
          }
        }
      },
    };
  },
});
