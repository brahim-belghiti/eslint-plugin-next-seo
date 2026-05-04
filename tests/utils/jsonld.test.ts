import tsParser from "@typescript-eslint/parser";
import { describe, expect, it } from "vitest";
import { getJsonLdScript } from "../../src/utils/jsonld";

function parse(code: string) {
  return tsParser.parseForESLint(code, {
    loc: true,
    range: true,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  });
}

function findAllJSXElements(node: unknown, results: unknown[] = []): unknown[] {
  if (!node || typeof node !== "object") return results;
  const n = node as Record<string, unknown> & { type?: string };
  if (n.type === "JSXElement") results.push(n);
  for (const key of Object.keys(n)) {
    if (key === "parent") continue;
    const val = n[key];
    if (Array.isArray(val)) {
      for (const item of val) findAllJSXElements(item, results);
    } else if (val && typeof val === "object" && "type" in (val as object)) {
      findAllJSXElements(val, results);
    }
  }
  return results;
}

function analyze(code: string) {
  const { ast, scopeManager } = parse(code);
  if (!scopeManager) throw new Error("no scope manager");
  const elements = findAllJSXElements(ast) as Array<
    Parameters<typeof getJsonLdScript>[0]
  >;
  const scope =
    scopeManager.scopes.find((s) => s.type === "module") ??
    scopeManager.scopes[0];
  if (!scope) throw new Error("no scope");
  return { elements, scope };
}

describe("getJsonLdScript", () => {
  it("returns null for a non-script element", () => {
    const { elements, scope } = analyze(`const x = <div />;`);
    expect(getJsonLdScript(elements[0]!, scope)).toBeNull();
  });

  it("returns null for a script without a type attribute", () => {
    const { elements, scope } = analyze(`const x = <script src="foo.js" />;`);
    expect(getJsonLdScript(elements[0]!, scope)).toBeNull();
  });

  it("returns null for a script with the wrong type", () => {
    const { elements, scope } = analyze(
      `const x = <script type="text/javascript" />;`,
    );
    expect(getJsonLdScript(elements[0]!, scope)).toBeNull();
  });

  it("returns null when type attribute is a dynamic expression", () => {
    const { elements, scope } = analyze(`
      const t = "application/ld+json";
      const x = <script type={t} />;
    `);
    expect(getJsonLdScript(elements[0]!, scope)).toBeNull();
  });

  it("extracts inline literal via dangerouslySetInnerHTML", () => {
    const { elements, scope } = analyze(`
      const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@type": "Article" }) }}
      />;
    `);
    const result = getJsonLdScript(elements[0]!, scope);
    expect(result).not.toBeNull();
    expect(result!.object?.type).toBe("ObjectExpression");
  });

  it("extracts inline literal via JSX child JSON.stringify (Script form)", () => {
    const { elements, scope } = analyze(`
      const x = <Script type="application/ld+json">
        {JSON.stringify({ "@type": "Product" })}
      </Script>;
    `);
    const result = getJsonLdScript(elements[0]!, scope);
    expect(result).not.toBeNull();
    expect(result!.object?.type).toBe("ObjectExpression");
  });

  it("extracts inline literal via lowercase script child JSON.stringify", () => {
    const { elements, scope } = analyze(`
      const x = <script type="application/ld+json">
        {JSON.stringify({ "@type": "Article" })}
      </script>;
    `);
    const result = getJsonLdScript(elements[0]!, scope);
    expect(result?.object?.type).toBe("ObjectExpression");
  });

  it("resolves a const-bound variable to its object literal", () => {
    const { elements, scope } = analyze(`
      const schema = { "@type": "Article", headline: "Hi" };
      const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />;
    `);
    const result = getJsonLdScript(elements[0]!, scope);
    expect(result?.object?.type).toBe("ObjectExpression");
  });

  it("returns object: null when JSON.stringify arg is a let-bound variable", () => {
    const { elements, scope } = analyze(`
      let schema = { "@type": "Article" };
      const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />;
    `);
    const result = getJsonLdScript(elements[0]!, scope);
    expect(result).not.toBeNull();
    expect(result!.object).toBeNull();
  });

  it("returns object: null when dangerouslySetInnerHTML is not JSON.stringify", () => {
    const { elements, scope } = analyze(`
      const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: '{"@type":"Article"}' }}
      />;
    `);
    const result = getJsonLdScript(elements[0]!, scope);
    expect(result).not.toBeNull();
    expect(result!.object).toBeNull();
  });

  it("returns object: null when the variable is imported", () => {
    const { elements, scope } = analyze(`
      import { schema } from "./schema";
      const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />;
    `);
    const result = getJsonLdScript(elements[0]!, scope);
    expect(result).not.toBeNull();
    expect(result!.object).toBeNull();
  });
});
