import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";
import { getJsonLdScript } from "../utils/jsonld";
import { KNOWN_TYPES, suggestKnownType } from "../utils/jsonld-types";
import { findProperty } from "../utils/metadata";

export const validJsonldType = createRule({
  name: "valid-jsonld-type",
  meta: {
    type: "problem",
    docs: {
      description:
        "Require `@context` and `@type` on JSON-LD scripts and flag typos in `@type`",
    },
    messages: {
      missingContext:
        "JSON-LD script is missing `@context` (should be `\"https://schema.org\"`).",
      missingType: "JSON-LD script is missing `@type`.",
      unknownType:
        "Unknown schema.org type `{{value}}`. Did you mean `{{suggestion}}`?",
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

        const contextProp = findProperty(result.object, "@context");
        if (!contextProp) {
          context.report({
            node: result.element,
            messageId: "missingContext",
          });
        }

        const typeProp = findProperty(result.object, "@type");
        if (!typeProp) {
          context.report({
            node: result.element,
            messageId: "missingType",
          });
          return;
        }

        const valueNode = typeProp.value;
        if (valueNode.type !== AST_NODE_TYPES.Literal) return;
        if (typeof valueNode.value !== "string") return;

        const value = valueNode.value;
        if (KNOWN_TYPES.has(value)) return;

        const suggestion = suggestKnownType(value);
        if (suggestion) {
          context.report({
            node: valueNode,
            messageId: "unknownType",
            data: { value, suggestion },
          });
        }
      },
    };
  },
});
