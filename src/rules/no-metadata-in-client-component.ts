import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";
import { findMetadataExport } from "../utils/metadata";

function hasUseClientDirective(program: TSESTree.Program): boolean {
  for (const stmt of program.body) {
    if (stmt.type !== AST_NODE_TYPES.ExpressionStatement) break;
    const expr = stmt.expression;
    if (expr.type === AST_NODE_TYPES.Literal && expr.value === "use client") {
      return true;
    }
  }
  return false;
}

export const noMetadataInClientComponent = createRule({
  name: "no-metadata-in-client-component",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow `metadata` exports in client components — Next.js silently ignores them",
    },
    messages: {
      metadataInClientComponent:
        "`metadata` exports are ignored in client components. Move metadata to a parent server component or `layout.tsx`.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program) {
        if (!hasUseClientDirective(program)) return;

        const result = findMetadataExport(program);
        if (!result) return;

        context.report({
          node: result.exportNode,
          messageId: "metadataInClientComponent",
        });
      },
    };
  },
});
