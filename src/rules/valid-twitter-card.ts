import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";
import { findMetadataExport, findProperty } from "../utils/metadata";

const VALID_CARDS = new Set(["summary", "summary_large_image", "app", "player"]);

export const validTwitterCard = createRule({
  name: "valid-twitter-card",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce valid `twitter.card` values",
    },
    messages: {
      unknownCard:
        "Twitter `card` `{{value}}` is not valid. Use `summary`, `summary_large_image`, `app`, or `player`.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        const result = findMetadataExport(program);
        if (!result || !result.object) return;

        const twitterProp = findProperty(result.object, "twitter");
        if (!twitterProp) return;
        if (twitterProp.value.type !== AST_NODE_TYPES.ObjectExpression) return;

        const cardProp = findProperty(twitterProp.value, "card");
        if (!cardProp) return;

        const val = cardProp.value;
        if (val.type !== AST_NODE_TYPES.Literal || typeof val.value !== "string") return;

        if (!VALID_CARDS.has(val.value)) {
          context.report({
            node: val,
            messageId: "unknownCard",
            data: { value: val.value },
          });
        }
      },
    };
  },
});
