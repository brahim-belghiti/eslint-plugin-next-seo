import { parse } from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";

export type SitemapAnalysis = {
  staticPaths: string[];
  hasDynamicGeneration: boolean;
};

const EMPTY: SitemapAnalysis = { staticPaths: [], hasDynamicGeneration: false };

function urlToPath(url: string): string {
  const noHost = url.replace(/^https?:\/\/[^/]+/, "");
  const noQuery = noHost.split(/[?#]/)[0] ?? "";
  if (!noQuery) return "/";
  if (noQuery.length > 1 && noQuery.endsWith("/")) return noQuery.slice(0, -1);
  return noQuery;
}

function collectStringConstants(program: TSESTree.Program): Map<string, string> {
  const constants = new Map<string, string>();
  for (const stmt of program.body) {
    if (stmt.type !== AST_NODE_TYPES.VariableDeclaration || stmt.kind !== "const") continue;
    for (const decl of stmt.declarations) {
      if (
        decl.id.type === AST_NODE_TYPES.Identifier &&
        decl.init?.type === AST_NODE_TYPES.Literal &&
        typeof decl.init.value === "string"
      ) {
        constants.set(decl.id.name, decl.init.value);
      }
    }
  }
  return constants;
}

function resolveTemplateLiteral(
  node: TSESTree.TemplateLiteral,
  constants: Map<string, string>,
): string | null {
  const parts: string[] = [];
  for (let i = 0; i < node.quasis.length; i++) {
    const quasi = node.quasis[i];
    if (!quasi || quasi.value.cooked == null) return null;
    parts.push(quasi.value.cooked);
    if (i < node.expressions.length) {
      const expr = node.expressions[i];
      if (
        expr &&
        expr.type === AST_NODE_TYPES.Identifier &&
        constants.has(expr.name)
      ) {
        parts.push(constants.get(expr.name)!);
      } else {
        return null;
      }
    }
  }
  return parts.join("");
}

function findDefaultExportBody(program: TSESTree.Program): TSESTree.Node | null {
  for (const stmt of program.body) {
    if (stmt.type !== AST_NODE_TYPES.ExportDefaultDeclaration) continue;
    const decl = stmt.declaration;
    if (
      decl.type === AST_NODE_TYPES.FunctionDeclaration ||
      decl.type === AST_NODE_TYPES.FunctionExpression ||
      decl.type === AST_NODE_TYPES.ArrowFunctionExpression
    ) {
      return decl.body;
    }
  }
  return null;
}

function walk(node: unknown, visitor: (n: TSESTree.Node) => void): void {
  if (!node || typeof node !== "object") return;
  if ("type" in node && typeof (node as { type: unknown }).type === "string") {
    visitor(node as TSESTree.Node);
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === "parent" || key === "loc" || key === "range") continue;
    if (Array.isArray(value)) {
      for (const item of value) walk(item, visitor);
    } else if (value && typeof value === "object") {
      walk(value, visitor);
    }
  }
}

function isUrlProperty(prop: TSESTree.ObjectLiteralElement): prop is TSESTree.Property {
  if (prop.type !== AST_NODE_TYPES.Property) return false;
  if (prop.computed) {
    return (
      prop.key.type === AST_NODE_TYPES.Literal && prop.key.value === "url"
    );
  }
  if (prop.key.type === AST_NODE_TYPES.Identifier) return prop.key.name === "url";
  if (prop.key.type === AST_NODE_TYPES.Literal) return prop.key.value === "url";
  return false;
}

export function parseSitemap(source: string): SitemapAnalysis {
  let ast: TSESTree.Program;
  try {
    ast = parse(source, {
      ecmaVersion: "latest",
      sourceType: "module",
      jsx: true,
      loc: true,
      range: true,
    }) as TSESTree.Program;
  } catch {
    return { ...EMPTY };
  }

  const body = findDefaultExportBody(ast);
  if (!body) return { ...EMPTY };

  const constants = collectStringConstants(ast);
  const staticPaths: string[] = [];
  let hasDynamicGeneration = false;

  walk(body, (node) => {
    if (
      node.type === AST_NODE_TYPES.CallExpression &&
      node.callee.type === AST_NODE_TYPES.MemberExpression &&
      !node.callee.computed &&
      node.callee.property.type === AST_NODE_TYPES.Identifier &&
      node.callee.property.name === "map"
    ) {
      hasDynamicGeneration = true;
    }

    if (
      node.type === AST_NODE_TYPES.SpreadElement &&
      node.argument.type === AST_NODE_TYPES.CallExpression
    ) {
      hasDynamicGeneration = true;
    }

    if (node.type !== AST_NODE_TYPES.ObjectExpression) return;

    for (const prop of node.properties) {
      if (!isUrlProperty(prop)) continue;
      const value = prop.value;
      if (value.type === AST_NODE_TYPES.Literal && typeof value.value === "string") {
        staticPaths.push(urlToPath(value.value));
      } else if (value.type === AST_NODE_TYPES.TemplateLiteral) {
        const resolved = resolveTemplateLiteral(value, constants);
        if (resolved !== null) {
          staticPaths.push(urlToPath(resolved));
        } else {
          hasDynamicGeneration = true;
        }
      } else {
        hasDynamicGeneration = true;
      }
    }
  });

  return { staticPaths, hasDynamicGeneration };
}
