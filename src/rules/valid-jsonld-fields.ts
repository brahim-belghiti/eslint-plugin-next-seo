import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";
import { getJsonLdScript } from "../utils/jsonld";
import { REQUIRED_FIELDS } from "../utils/jsonld-types";
import { findProperty } from "../utils/metadata";

export const validJsonldFields = createRule({
  name: "valid-jsonld-fields",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require fields needed for Google rich-results eligibility per JSON-LD `@type`",
    },
    messages: {
      missingRequiredField:
        "JSON-LD `{{type}}` is missing the `{{field}}` property required for rich-results eligibility.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXElement(element) {
        const scope = context.sourceCode.getScope(element);
        const result = getJsonLdScript(element, scope);
        if (!result || !result.object) return;

        const typeProp = findProperty(result.object, "@type");
        if (!typeProp) return;

        const valueNode = typeProp.value;
        if (valueNode.type !== AST_NODE_TYPES.Literal) return;
        if (typeof valueNode.value !== "string") return;

        const required = REQUIRED_FIELDS[valueNode.value];
        if (!required) return;

        for (const field of required) {
          if (!findProperty(result.object, field)) {
            context.report({
              node: result.element,
              messageId: "missingRequiredField",
              data: { type: valueNode.value, field },
            });
          }
        }
      },
    };
  },
});
