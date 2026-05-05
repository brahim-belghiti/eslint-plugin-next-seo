import { describe, expect, it } from "vitest";
import { generateSitemap } from "../../../src/cli/init/sitemap";

describe("generateSitemap", () => {
  it("produces a runnable file with no routes", () => {
    const out = generateSitemap({ baseUrl: "https://example.com", staticPaths: [], dynamicPaths: [] });
    expect(out).toContain('import type { MetadataRoute } from "next"');
    expect(out).toContain("export default async function sitemap()");
    expect(out).toContain("MetadataRoute.Sitemap");
    expect(out).toContain("staticRoutes = []");
    expect(out).not.toContain("TODO");
  });

  it("static-only routes — no TODO sections", () => {
    const out = generateSitemap({
      baseUrl: "https://example.com",
      staticPaths: ["/", "/about", "/blog"],
      dynamicPaths: [],
    });
    expect(out).toContain('"/",');
    expect(out).toContain('"/about",');
    expect(out).toContain('"/blog",');
    expect(out).not.toContain("TODO");
    expect(out).toContain("...staticEntries,");
  });

  it("custom baseUrl appears in the BASE_URL constant", () => {
    const out = generateSitemap({
      baseUrl: "https://mysite.io",
      staticPaths: ["/"],
      dynamicPaths: [],
    });
    expect(out).toContain('const BASE_URL = "https://mysite.io"');
  });

  it("mixed static and dynamic — emits TODO for dynamic path", () => {
    const out = generateSitemap({
      baseUrl: "https://example.com",
      staticPaths: ["/", "/about"],
      dynamicPaths: ["/blog/[slug]"],
    });
    expect(out).toContain("TODO: dynamic route detected at /blog/[slug]");
    expect(out).toContain("blogEntries");
    expect(out).toContain("// ...blogEntries,");
    expect(out).toContain("...staticEntries,");
  });

  it("multiple dynamic paths — each gets its own TODO block", () => {
    const out = generateSitemap({
      baseUrl: "https://example.com",
      staticPaths: ["/"],
      dynamicPaths: ["/blog/[slug]", "/products/[id]"],
    });
    expect(out).toContain("TODO: dynamic route detected at /blog/[slug]");
    expect(out).toContain("TODO: dynamic route detected at /products/[id]");
    expect(out).toContain("blogEntries");
    expect(out).toContain("productsEntries");
    expect(out).toContain("// ...blogEntries,");
    expect(out).toContain("// ...productsEntries,");
  });

  it("root route uses empty suffix in URL template", () => {
    const out = generateSitemap({
      baseUrl: "https://example.com",
      staticPaths: ["/"],
      dynamicPaths: [],
    });
    expect(out).toContain('route === "/" ? ""');
  });
});
