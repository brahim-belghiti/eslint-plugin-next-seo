import path from "node:path";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";

const PAGE_FILE_RE = /^page\.(tsx|ts|jsx|js)$/;

/**
 * Walk up parent pointers to find the smallest enclosing render path:
 * - a `ReturnStatement` (the most common React pattern), or
 * - an arrow function with an expression body (implicit return).
 *
 * Two H1s sharing a render path can both end up in the rendered tree.
 * Two H1s in different render paths are mutually exclusive — a function
 * call only executes one return per invocation.
 *
 * Returns null when the H1 isn't in any render path (e.g. it's stored
 * in a top-level constant or inside a callback). Those don't contribute
 * to the page's H1 count for this rule.
 */
function findRenderPath(node: TSESTree.Node): TSESTree.Node | null {
  let current: TSESTree.Node | undefined = node.parent;
  while (current) {
    if (current.type === AST_NODE_TYPES.ReturnStatement) {
      return current;
    }
    if (
      current.type === AST_NODE_TYPES.ArrowFunctionExpression ||
      current.type === AST_NODE_TYPES.FunctionExpression ||
      current.type === AST_NODE_TYPES.FunctionDeclaration
    ) {
      if (
        current.type === AST_NODE_TYPES.ArrowFunctionExpression &&
        current.body.type !== AST_NODE_TYPES.BlockStatement
      ) {
        return current;
      }
      return null;
    }
    current = current.parent;
  }
  return null;
}

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

    const groups = new Map<TSESTree.Node, TSESTree.JSXElement[]>();

    return {
      JSXElement(node) {
        const name = node.openingElement.name;
        if (name.type !== AST_NODE_TYPES.JSXIdentifier) return;
        if (name.name !== "h1") return;

        const path = findRenderPath(node);
        if (!path) return;

        const list = groups.get(path) ?? [];
        list.push(node);
        groups.set(path, list);
      },
      "Program:exit"() {
        for (const list of groups.values()) {
          for (let i = 1; i < list.length; i++) {
            context.report({
              node: list[i]!,
              messageId: "multipleH1",
            });
          }
        }
      },
    };
  },
});
