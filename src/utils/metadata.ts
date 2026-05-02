import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

export type MetadataKind = "object" | "function";

export type MetadataExport = {
  kind: MetadataKind;
  exportNode: TSESTree.ExportNamedDeclaration;
  /**
   * The analyzable object literal:
   * - `kind: "object"` — the metadata object itself
   * - `kind: "function"` — the object literal returned by generateMetadata,
   *   if statically determinable; otherwise null
   */
  object: TSESTree.ObjectExpression | null;
};

export function findMetadataExport(
  program: TSESTree.Program,
): MetadataExport | null {
  for (const stmt of program.body) {
    if (stmt.type !== AST_NODE_TYPES.ExportNamedDeclaration) continue;
    const decl = stmt.declaration;
    if (!decl) continue;

    if (decl.type === AST_NODE_TYPES.VariableDeclaration) {
      for (const v of decl.declarations) {
        if (v.id.type !== AST_NODE_TYPES.Identifier) continue;

        if (
          v.id.name === "metadata" &&
          v.init?.type === AST_NODE_TYPES.ObjectExpression
        ) {
          return { kind: "object", exportNode: stmt, object: v.init };
        }

        if (
          v.id.name === "generateMetadata" &&
          v.init &&
          (v.init.type === AST_NODE_TYPES.ArrowFunctionExpression ||
            v.init.type === AST_NODE_TYPES.FunctionExpression)
        ) {
          return {
            kind: "function",
            exportNode: stmt,
            object: extractReturnedObject(v.init),
          };
        }
      }
      continue;
    }

    if (
      decl.type === AST_NODE_TYPES.FunctionDeclaration &&
      decl.id?.name === "generateMetadata"
    ) {
      return {
        kind: "function",
        exportNode: stmt,
        object: extractReturnedObject(decl),
      };
    }
  }
  return null;
}

function extractReturnedObject(
  fn:
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.ArrowFunctionExpression,
): TSESTree.ObjectExpression | null {
  const body = fn.body;

  if (body.type === AST_NODE_TYPES.ObjectExpression) {
    return body;
  }

  if (body.type !== AST_NODE_TYPES.BlockStatement) return null;

  for (const stmt of body.body) {
    if (stmt.type === AST_NODE_TYPES.ReturnStatement) {
      if (stmt.argument?.type === AST_NODE_TYPES.ObjectExpression) {
        return stmt.argument;
      }
      return null;
    }
  }
  return null;
}

export function findProperty(
  object: TSESTree.ObjectExpression,
  name: string,
): TSESTree.Property | undefined {
  for (const prop of object.properties) {
    if (prop.type !== AST_NODE_TYPES.Property) continue;
    if (prop.computed) continue;

    const { key } = prop;
    if (key.type === AST_NODE_TYPES.Identifier && key.name === name) {
      return prop;
    }
    if (key.type === AST_NODE_TYPES.Literal && key.value === name) {
      return prop;
    }
  }
  return undefined;
}

export function isEmptyString(node: TSESTree.Node): boolean {
  if (node.type === AST_NODE_TYPES.Literal && typeof node.value === "string") {
    return node.value.trim() === "";
  }
  if (node.type === AST_NODE_TYPES.TemplateLiteral) {
    if (node.expressions.length !== 0) return false;
    const quasi = node.quasis[0];
    if (!quasi || node.quasis.length !== 1) return false;
    return quasi.value.cooked.trim() === "";
  }
  return false;
}
