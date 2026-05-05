import { describe, expect, it } from "vitest";
import { parseSitemap } from "../../src/cli/sitemap-parse";

describe("parseSitemap", () => {
  it("returns empty result for empty source", () => {
    expect(parseSitemap("")).toEqual({ staticPaths: [], hasDynamicGeneration: false });
  });

  it("returns empty result when there is no default export", () => {
    const source = `export const foo = 1;`;
    expect(parseSitemap(source)).toEqual({ staticPaths: [], hasDynamicGeneration: false });
  });

  it("extracts a single string-literal URL", () => {
    const source = `
      export default function sitemap() {
        return [{ url: "https://example.com/about" }];
      }
    `;
    const result = parseSitemap(source);
    expect(result.staticPaths).toEqual(["/about"]);
    expect(result.hasDynamicGeneration).toBe(false);
  });

  it("extracts multiple string-literal URLs", () => {
    const source = `
      export default function sitemap() {
        return [
          { url: "https://example.com/" },
          { url: "https://example.com/about" },
          { url: "https://example.com/blog" },
        ];
      }
    `;
    const result = parseSitemap(source);
    expect(result.staticPaths).toEqual(["/", "/about", "/blog"]);
    expect(result.hasDynamicGeneration).toBe(false);
  });

  it("resolves template literals using a top-level const", () => {
    const source = `
      const BASE_URL = "https://example.com";
      export default function sitemap() {
        return [
          { url: \`\${BASE_URL}/about\` },
          { url: \`\${BASE_URL}/contact\` },
        ];
      }
    `;
    const result = parseSitemap(source);
    expect(result.staticPaths).toEqual(["/about", "/contact"]);
    expect(result.hasDynamicGeneration).toBe(false);
  });

  it("flags hasDynamicGeneration for unresolvable expressions in templates", () => {
    const source = `
      export default function sitemap() {
        return [{ url: \`\${process.env.SITE_URL}/about\` }];
      }
    `;
    const result = parseSitemap(source);
    expect(result.staticPaths).toEqual([]);
    expect(result.hasDynamicGeneration).toBe(true);
  });

  it("captures static literals AND flags hasDynamicGeneration for .map spreads", () => {
    const source = `
      const BASE_URL = "https://example.com";
      export default async function sitemap() {
        const posts = await getPosts();
        return [
          { url: \`\${BASE_URL}/about\` },
          ...posts.map((p) => ({ url: \`\${BASE_URL}/blog/\${p.slug}\` })),
        ];
      }
    `;
    const result = parseSitemap(source);
    expect(result.staticPaths).toEqual(["/about"]);
    expect(result.hasDynamicGeneration).toBe(true);
  });

  it("normalizes URLs with query string and hash", () => {
    const source = `
      export default function sitemap() {
        return [{ url: "https://example.com/blog/post-1?utm=x#top" }];
      }
    `;
    expect(parseSitemap(source).staticPaths).toEqual(["/blog/post-1"]);
  });

  it("normalizes trailing slash but preserves the root", () => {
    const source = `
      export default function sitemap() {
        return [
          { url: "https://example.com/" },
          { url: "https://example.com/about/" },
        ];
      }
    `;
    expect(parseSitemap(source).staticPaths).toEqual(["/", "/about"]);
  });

  it("handles relative URLs (no protocol/host)", () => {
    const source = `
      export default function sitemap() {
        return [{ url: "/about" }];
      }
    `;
    expect(parseSitemap(source).staticPaths).toEqual(["/about"]);
  });

  it("returns empty result on parse error", () => {
    const result = parseSitemap("this is not valid TypeScript {[(");
    expect(result).toEqual({ staticPaths: [], hasDynamicGeneration: false });
  });

  it("ignores url properties outside the default export", () => {
    const source = `
      const config = { url: "https://example.com/secret" };
      export default function sitemap() {
        return [{ url: "https://example.com/about" }];
      }
    `;
    expect(parseSitemap(source).staticPaths).toEqual(["/about"]);
  });

  it("supports an arrow function default export with expression body", () => {
    const source = `
      export default () => [{ url: "https://example.com/about" }];
    `;
    expect(parseSitemap(source).staticPaths).toEqual(["/about"]);
  });

  it("supports an async function default export", () => {
    const source = `
      export default async function sitemap() {
        return [{ url: "https://example.com/about" }];
      }
    `;
    expect(parseSitemap(source).staticPaths).toEqual(["/about"]);
  });
});
