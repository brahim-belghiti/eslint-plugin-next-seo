import path from "node:path";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule";

const SITEMAP_FILE_RE = /^sitemap\.(tsx?|jsx?)$/;

const VALID_CHANGE_FREQUENCY = new Set([
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
]);

function getReturnedArray(
  fn:
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression,
): TSESTree.ArrayExpression | null {
  const body = fn.body;

  if (body.type === AST_NODE_TYPES.ArrayExpression) {
    return body;
  }

  if (body.type !== AST_NODE_TYPES.BlockStatement) return null;

  for (const stmt of body.body) {
    if (stmt.type === AST_NODE_TYPES.ReturnStatement) {
      if (stmt.argument?.type === AST_NODE_TYPES.ArrayExpression) {
        return stmt.argument;
      }
      return null;
    }
  }
  return null;
}

function findProperty(
  object: TSESTree.ObjectExpression,
  name: string,
): TSESTree.Property | undefined {
  for (const prop of object.properties) {
    if (prop.type !== AST_NODE_TYPES.Property) continue;
    if (prop.computed) continue;
    const { key } = prop;
    if (key.type === AST_NODE_TYPES.Identifier && key.name === name) return prop;
    if (key.type === AST_NODE_TYPES.Literal && key.value === name) return prop;
  }
  return undefined;
}

export const validSitemapShape = createRule({
  name: "valid-sitemap-shape",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce well-formed entries in `app/sitemap.ts`",
    },
    messages: {
      entryMissingUrl: "Sitemap entry is missing required `url` property.",
      invalidPriority:
        "Sitemap entry `priority` `{{value}}` must be a number between 0 and 1.",
      invalidChangeFrequency:
        "Sitemap entry `changeFrequency` `{{value}}` is not valid. Use `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, or `never`.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const basename = path.basename(context.filename);
    if (!SITEMAP_FILE_RE.test(basename)) return {};

    return {
      Program(program) {
        const defaultExport = program.body.find(
          (s) => s.type === AST_NODE_TYPES.ExportDefaultDeclaration,
        ) as TSESTree.ExportDefaultDeclaration | undefined;
        if (!defaultExport) return;

        const decl = defaultExport.declaration;

        let fn:
          | TSESTree.FunctionDeclaration
          | TSESTree.FunctionExpression
          | TSESTree.ArrowFunctionExpression
          | null = null;

        if (
          decl.type === AST_NODE_TYPES.FunctionDeclaration ||
          decl.type === AST_NODE_TYPES.FunctionExpression ||
          decl.type === AST_NODE_TYPES.ArrowFunctionExpression
        ) {
          fn = decl;
        }

        if (!fn) return;

        const array = getReturnedArray(fn);
        if (!array) return;

        for (const element of array.elements) {
          if (!element) continue;
          if (element.type !== AST_NODE_TYPES.ObjectExpression) continue;

          const urlProp = findProperty(element, "url");
          if (!urlProp) {
            context.report({ node: element, messageId: "entryMissingUrl" });
          }

          const priorityProp = findProperty(element, "priority");
          if (priorityProp) {
            const val = priorityProp.value;
            let numericValue: number | null = null;
            let reportNode: TSESTree.Node = val;

            if (val.type === AST_NODE_TYPES.Literal && typeof val.value === "number") {
              numericValue = val.value;
            } else if (
              val.type === AST_NODE_TYPES.UnaryExpression &&
              val.operator === "-" &&
              val.argument.type === AST_NODE_TYPES.Literal &&
              typeof val.argument.value === "number"
            ) {
              numericValue = -val.argument.value;
              reportNode = val;
            }

            if (numericValue !== null && (numericValue < 0 || numericValue > 1)) {
              context.report({
                node: reportNode,
                messageId: "invalidPriority",
                data: { value: numericValue },
              });
            }
          }

          const cfProp = findProperty(element, "changeFrequency");
          if (cfProp) {
            const val = cfProp.value;
            if (
              val.type === AST_NODE_TYPES.Literal &&
              typeof val.value === "string" &&
              !VALID_CHANGE_FREQUENCY.has(val.value)
            ) {
              context.report({
                node: val,
                messageId: "invalidChangeFrequency",
                data: { value: val.value },
              });
            }
          }
        }
      },
    };
  },
});
