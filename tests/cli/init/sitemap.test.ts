import { describe, expect, it } from "vitest";
import { generateSitemap } from "../../../src/cli/init/sitemap";

describe("generateSitemap", () => {
  it("produces a runnable file with no routes", () => {
    const out = generateSitemap({ baseUrl: "https://example.com", staticPaths: [], dynamicPaths: [] });
    expect(out).toContain('import type { MetadataRoute } from "next"');
    expect(out).toContain("export default async function sitemap()");
    expect(out).toContain("MetadataRoute.Sitemap");
    expect(out).toContain("const staticEntries: MetadataRoute.Sitemap = []");
    expect(out).not.toContain("TODO");
  });

  it("static-only routes — explicit object literals, no TODO sections", () => {
    const out = generateSitemap({
      baseUrl: "https://example.com",
      staticPaths: ["/", "/about", "/blog"],
      dynamicPaths: [],
    });
    expect(out).toContain("url: `${BASE_URL}`,");
    expect(out).toContain("url: `${BASE_URL}/about`,");
    expect(out).toContain("url: `${BASE_URL}/blog`,");
    expect(out).not.toContain("TODO");
    expect(out).toContain("...staticEntries,");
    expect(out).not.toContain("staticRoutes");
    expect(out).not.toContain(".map((route)");
  });

  it("root route gets priority 1.0 and others 0.8", () => {
    const out = generateSitemap({
      baseUrl: "https://example.com",
      staticPaths: ["/", "/about"],
      dynamicPaths: [],
    });
    const rootBlock = out.slice(out.indexOf("`${BASE_URL}`,"));
    expect(rootBlock).toContain("priority: 1.0");
    const aboutBlock = out.slice(out.indexOf("`${BASE_URL}/about`,"));
    expect(aboutBlock).toContain("priority: 0.8");
  });

  it("each entry has lastModified, changeFrequency, priority", () => {
    const out = generateSitemap({
      baseUrl: "https://example.com",
      staticPaths: ["/about"],
      dynamicPaths: [],
    });
    expect(out).toContain("lastModified: new Date()");
    expect(out).toContain('changeFrequency: "weekly" as const');
    expect(out).toContain("priority: 0.8");
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
    expect(out).toContain("url: `${BASE_URL}/about`,");
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
});
