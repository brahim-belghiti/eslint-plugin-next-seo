import { createRule } from "./create-rule";
import { findMetadataExport, findProperty } from "./metadata";

export type RequireMetadataFieldOptions = {
  name: string;
  field: string;
  description: string;
};

export function requireMetadataField(opts: RequireMetadataFieldOptions) {
  return createRule({
    name: opts.name,
    meta: {
      type: "problem",
      docs: {
        description: opts.description,
      },
      messages: {
        missingField: "Metadata export is missing the `{{field}}` property.",
      },
      schema: [],
    },
    defaultOptions: [],
    create(context) {
      return {
        Program(program) {
          const result = findMetadataExport(program);
          if (!result || !result.object) return;

          if (!findProperty(result.object, opts.field)) {
            context.report({
              node: result.exportNode,
              messageId: "missingField",
              data: { field: opts.field },
            });
          }
        },
      };
    },
  });
}
