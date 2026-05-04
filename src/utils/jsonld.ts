import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from "@typescript-eslint/utils";

export type JsonLdScript = {
  element: TSESTree.JSXElement;
  object: TSESTree.ObjectExpression | null;
};

const SCRIPT_NAMES = new Set(["script", "Script"]);
const JSON_LD_TYPE = "application/ld+json";

export function getJsonLdScript(
  element: TSESTree.JSXElement,
  scope: TSESLint.Scope.Scope,
): JsonLdScript | null {
  const { openingElement } = element;
  if (openingElement.name.type !== AST_NODE_TYPES.JSXIdentifier) return null;
  if (!SCRIPT_NAMES.has(openingElement.name.name)) return null;
  if (!hasJsonLdTypeAttribute(openingElement)) return null;

  const object = extractObject(element, scope);
  return { element, object };
}

function hasJsonLdTypeAttribute(
  opening: TSESTree.JSXOpeningElement,
): boolean {
  for (const attr of opening.attributes) {
    if (attr.type !== AST_NODE_TYPES.JSXAttribute) continue;
    if (attr.name.type !== AST_NODE_TYPES.JSXIdentifier) continue;
    if (attr.name.name !== "type") continue;
    if (!attr.value) return false;
    if (attr.value.type !== AST_NODE_TYPES.Literal) return false;
    return attr.value.value === JSON_LD_TYPE;
  }
  return false;
}

function extractObject(
  element: TSESTree.JSXElement,
  scope: TSESLint.Scope.Scope,
): TSESTree.ObjectExpression | null {
  for (const attr of element.openingElement.attributes) {
    if (attr.type !== AST_NODE_TYPES.JSXAttribute) continue;
    if (attr.name.type !== AST_NODE_TYPES.JSXIdentifier) continue;
    if (attr.name.name !== "dangerouslySetInnerHTML") continue;
    return extractFromDangerouslySetInnerHTML(attr, scope);
  }

  for (const child of element.children) {
    if (child.type !== AST_NODE_TYPES.JSXExpressionContainer) continue;
    return extractFromJsonStringify(child.expression, scope);
  }
  return null;
}

function extractFromDangerouslySetInnerHTML(
  attr: TSESTree.JSXAttribute,
  scope: TSESLint.Scope.Scope,
): TSESTree.ObjectExpression | null {
  if (!attr.value) return null;
  if (attr.value.type !== AST_NODE_TYPES.JSXExpressionContainer) return null;
  const expr = attr.value.expression;
  if (expr.type !== AST_NODE_TYPES.ObjectExpression) return null;

  for (const prop of expr.properties) {
    if (prop.type !== AST_NODE_TYPES.Property) continue;
    if (prop.computed) continue;
    const isHtml =
      (prop.key.type === AST_NODE_TYPES.Identifier &&
        prop.key.name === "__html") ||
      (prop.key.type === AST_NODE_TYPES.Literal && prop.key.value === "__html");
    if (!isHtml) continue;
    return extractFromJsonStringify(prop.value, scope);
  }
  return null;
}

function extractFromJsonStringify(
  node: TSESTree.Node,
  scope: TSESLint.Scope.Scope,
): TSESTree.ObjectExpression | null {
  if (node.type !== AST_NODE_TYPES.CallExpression) return null;
  const { callee } = node;
  if (callee.type !== AST_NODE_TYPES.MemberExpression) return null;
  if (callee.computed) return null;
  if (callee.object.type !== AST_NODE_TYPES.Identifier) return null;
  if (callee.object.name !== "JSON") return null;
  if (callee.property.type !== AST_NODE_TYPES.Identifier) return null;
  if (callee.property.name !== "stringify") return null;

  const arg = node.arguments[0];
  if (!arg) return null;
  if (arg.type === AST_NODE_TYPES.ObjectExpression) return arg;
  if (arg.type === AST_NODE_TYPES.Identifier) {
    return resolveConstObject(arg, scope);
  }
  return null;
}

function resolveConstObject(
  identifier: TSESTree.Identifier,
  scope: TSESLint.Scope.Scope,
): TSESTree.ObjectExpression | null {
  let current: TSESLint.Scope.Scope | null = scope;
  while (current) {
    for (const variable of current.variables) {
      if (variable.name !== identifier.name) continue;
      if (variable.defs.length !== 1) return null;
      const def = variable.defs[0]!;
      if (def.type !== "Variable") return null;
      const decl = def.parent;
      if (!decl || decl.type !== AST_NODE_TYPES.VariableDeclaration) {
        return null;
      }
      if (decl.kind !== "const") return null;
      const init = def.node.init;
      if (init?.type === AST_NODE_TYPES.ObjectExpression) return init;
      return null;
    }
    current = current.upper;
  }
  return null;
}
