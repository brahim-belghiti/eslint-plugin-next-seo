import { parse } from "@typescript-eslint/parser";
import type { TSESTree } from "@typescript-eslint/utils";
import { describe, expect, it } from "vitest";
import {
  findMetadataExport,
  findProperty,
  isEmptyString,
} from "../../src/utils/metadata";

function parseProgram(code: string): TSESTree.Program {
  return parse(code, {
    sourceType: "module",
    ecmaVersion: 2022,
    range: true,
    loc: true,
  }) as TSESTree.Program;
}

describe("findMetadataExport", () => {
  it("returns null when no metadata export exists", () => {
    const program = parseProgram(`export const foo = "bar";`);
    expect(findMetadataExport(program)).toBeNull();
  });

  it("finds an object metadata export", () => {
    const program = parseProgram(`export const metadata = { title: "Hello" };`);
    const result = findMetadataExport(program);
    expect(result?.kind).toBe("object");
    expect(result?.object?.type).toBe("ObjectExpression");
  });

  it("finds generateMetadata function returning an object literal", () => {
    const program = parseProgram(`
      export function generateMetadata() {
        return { title: "Hello" };
      }
    `);
    const result = findMetadataExport(program);
    expect(result?.kind).toBe("function");
    expect(result?.object?.type).toBe("ObjectExpression");
  });

  it("finds async generateMetadata returning an object literal", () => {
    const program = parseProgram(`
      export async function generateMetadata() {
        return { title: "Hello" };
      }
    `);
    const result = findMetadataExport(program);
    expect(result?.kind).toBe("function");
    expect(result?.object?.type).toBe("ObjectExpression");
  });

  it("finds arrow generateMetadata with expression body", () => {
    const program = parseProgram(
      `export const generateMetadata = () => ({ title: "Hello" });`,
    );
    const result = findMetadataExport(program);
    expect(result?.kind).toBe("function");
    expect(result?.object?.type).toBe("ObjectExpression");
  });

  it("returns null object when generateMetadata return is not statically analyzable", () => {
    const program = parseProgram(`
      export function generateMetadata() {
        const data = loadFromCms();
        return data;
      }
    `);
    const result = findMetadataExport(program);
    expect(result?.kind).toBe("function");
    expect(result?.object).toBeNull();
  });

  it("ignores unrelated named exports", () => {
    const program = parseProgram(`
      export const dynamic = "force-dynamic";
      export const revalidate = 60;
    `);
    expect(findMetadataExport(program)).toBeNull();
  });
});

describe("findProperty", () => {
  function getMetadataObject(code: string): TSESTree.ObjectExpression {
    const program = parseProgram(code);
    const result = findMetadataExport(program);
    if (!result?.object) throw new Error("expected metadata object in test");
    return result.object;
  }

  it("finds a property by identifier key", () => {
    const obj = getMetadataObject(
      `export const metadata = { title: "Hello" };`,
    );
    expect(findProperty(obj, "title")?.type).toBe("Property");
  });

  it("finds a property by string literal key", () => {
    const obj = getMetadataObject(
      `export const metadata = { "title": "Hello" };`,
    );
    expect(findProperty(obj, "title")?.type).toBe("Property");
  });

  it("returns undefined when the property is missing", () => {
    const obj = getMetadataObject(
      `export const metadata = { description: "x" };`,
    );
    expect(findProperty(obj, "title")).toBeUndefined();
  });

  it("skips computed keys", () => {
    const obj = getMetadataObject(`
      const k = "title";
      export const metadata = { [k]: "Hello" };
    `);
    expect(findProperty(obj, "title")).toBeUndefined();
  });
});

describe("isEmptyString", () => {
  function getValue(code: string): TSESTree.Node {
    const program = parseProgram(code);
    const result = findMetadataExport(program);
    if (!result?.object) throw new Error("expected metadata object in test");
    const prop = findProperty(result.object, "title");
    if (!prop) throw new Error("expected title property in test");
    return prop.value;
  }

  it("returns true for empty string literal", () => {
    expect(isEmptyString(getValue(`export const metadata = { title: "" };`))).toBe(true);
  });

  it("returns true for whitespace-only string literal", () => {
    expect(isEmptyString(getValue(`export const metadata = { title: "   " };`))).toBe(true);
  });

  it("returns true for empty template literal", () => {
    expect(isEmptyString(getValue("export const metadata = { title: `` };"))).toBe(true);
  });

  it("returns false for non-empty string literal", () => {
    expect(isEmptyString(getValue(`export const metadata = { title: "Hello" };`))).toBe(false);
  });

  it("returns false for template literal with expressions", () => {
    expect(
      isEmptyString(getValue("export const metadata = { title: `${x}` };")),
    ).toBe(false);
  });

  it("returns false for non-string nodes", () => {
    expect(
      isEmptyString(getValue(`export const metadata = { title: { template: "%s" } };`)),
    ).toBe(false);
  });
});
