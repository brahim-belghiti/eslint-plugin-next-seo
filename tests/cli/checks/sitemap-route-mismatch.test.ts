import { describe, expect, it } from "vitest";
import { run } from "../../../src/cli/checks/sitemap-route-mismatch";
import type { Accumulator, RouteInfo } from "../../../src/cli/types";

function staticRoute(urlPath: string): RouteInfo {
  return { filePath: `/fake/app${urlPath}/page.tsx`, hasMetadata: false, urlPath, isDynamic: false };
}

function dynamicRoute(urlPath: string): RouteInfo {
  return { filePath: `/fake/app${urlPath}/page.tsx`, hasMetadata: false, urlPath, isDynamic: true };
}

function buildAcc(overrides: Partial<Accumulator> = {}): Accumulator {
  return {
    appDir: "/fake/app",
    routes: [],
    sitemapFile: "/fake/app/sitemap.ts",
    sitemapAnalysis: { staticPaths: [], hasDynamicGeneration: false },
    robotsFile: null,
    ...overrides,
  };
}

describe("sitemap-route-mismatch", () => {
  it("returns no findings when sitemapFile is null", () => {
    const findings = run(buildAcc({ sitemapFile: null, sitemapAnalysis: null }));
    expect(findings).toHaveLength(0);
  });

  it("returns no findings when sitemapAnalysis is null", () => {
    const findings = run(buildAcc({ sitemapAnalysis: null }));
    expect(findings).toHaveLength(0);
  });

  it("returns no findings when all static routes are covered", () => {
    const findings = run(
      buildAcc({
        routes: [staticRoute("/"), staticRoute("/about")],
        sitemapAnalysis: { staticPaths: ["/", "/about"], hasDynamicGeneration: false },
      }),
    );
    expect(findings).toHaveLength(0);
  });

  it("reports error for static route missing from sitemap", () => {
    const findings = run(
      buildAcc({
        routes: [staticRoute("/"), staticRoute("/about")],
        sitemapAnalysis: { staticPaths: ["/"], hasDynamicGeneration: false },
      }),
    );
    const errors = findings.filter((f) => f.level === "error");
    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain("/about");
    expect(errors[0]?.check).toBe("sitemap-route-mismatch");
  });

  it("reports error for sitemap path with no matching page", () => {
    const findings = run(
      buildAcc({
        routes: [staticRoute("/")],
        sitemapAnalysis: { staticPaths: ["/", "/ghost"], hasDynamicGeneration: false },
      }),
    );
    const errors = findings.filter((f) => f.level === "error");
    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain("/ghost");
    expect(errors[0]?.file).toBe("/fake/app/sitemap.ts");
  });

  it("hasDynamicGeneration suppresses missing-route errors", () => {
    const findings = run(
      buildAcc({
        routes: [staticRoute("/"), staticRoute("/about")],
        sitemapAnalysis: { staticPaths: ["/"], hasDynamicGeneration: true },
      }),
    );
    const errors = findings.filter((f) => f.level === "error");
    expect(errors).toHaveLength(0);
  });

  it("hasDynamicGeneration still reports stale sitemap entries", () => {
    const findings = run(
      buildAcc({
        routes: [staticRoute("/")],
        sitemapAnalysis: { staticPaths: ["/", "/ghost"], hasDynamicGeneration: true },
      }),
    );
    const errors = findings.filter((f) => f.level === "error");
    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain("/ghost");
  });

  it("hasDynamicGeneration always emits the info note", () => {
    const findings = run(
      buildAcc({
        routes: [staticRoute("/")],
        sitemapAnalysis: { staticPaths: ["/"], hasDynamicGeneration: true },
      }),
    );
    const info = findings.filter((f) => f.level === "info");
    expect(info).toHaveLength(1);
    expect(info[0]?.message).toContain("dynamic entries");
  });

  it("sitemap path matching a [slug] dynamic route is not an error", () => {
    const findings = run(
      buildAcc({
        routes: [staticRoute("/blog"), dynamicRoute("/blog/[slug]")],
        sitemapAnalysis: { staticPaths: ["/blog", "/blog/post-1", "/blog/post-2"], hasDynamicGeneration: false },
      }),
    );
    expect(findings).toHaveLength(0);
  });

  it("catch-all [...rest] matches multi-segment paths", () => {
    const findings = run(
      buildAcc({
        routes: [dynamicRoute("/docs/[...rest]")],
        sitemapAnalysis: { staticPaths: ["/docs/guide/setup"], hasDynamicGeneration: false },
      }),
    );
    const errors = findings.filter((f) => f.level === "error");
    expect(errors).toHaveLength(0);
  });

  it("optional catch-all [[...optional]] matches paths", () => {
    const findings = run(
      buildAcc({
        routes: [dynamicRoute("/shop/[[...optional]]")],
        sitemapAnalysis: { staticPaths: ["/shop/clothing/t-shirts"], hasDynamicGeneration: false },
      }),
    );
    const errors = findings.filter((f) => f.level === "error");
    expect(errors).toHaveLength(0);
  });

  it("dynamic routes in app/ are not flagged as missing from sitemap", () => {
    const findings = run(
      buildAcc({
        routes: [staticRoute("/"), dynamicRoute("/blog/[slug]")],
        sitemapAnalysis: { staticPaths: ["/"], hasDynamicGeneration: false },
      }),
    );
    expect(findings).toHaveLength(0);
  });
});
