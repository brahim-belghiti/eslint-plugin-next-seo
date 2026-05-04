import path from "node:path";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";

const PAGE_FILE_RE = /^page\.(tsx|ts|jsx|js)$/;

export const singleH1PerPage = createRule({
  name: "single-h1-per-page",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow more than one `<h1>` element in a Next.js App Router page file",
    },
    messages: {
      multipleH1:
        "A page should have only one `<h1>`. Use lower heading levels (`<h2>`, `<h3>`) for additional sections.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const basename = path.basename(context.filename);
    if (!PAGE_FILE_RE.test(basename)) return {};

    const h1s: TSESTree.JSXElement[] = [];

    return {
      JSXElement(node) {
        const name = node.openingElement.name;
        if (name.type !== AST_NODE_TYPES.JSXIdentifier) return;
        if (name.name !== "h1") return;
        h1s.push(node);
      },
      "Program:exit"() {
        for (let i = 1; i < h1s.length; i++) {
          context.report({
            node: h1s[i]!,
            messageId: "multipleH1",
          });
        }
      },
    };
  },
});
