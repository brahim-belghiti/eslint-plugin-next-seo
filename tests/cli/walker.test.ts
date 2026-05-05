import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findAppDir, findSitemapAndRobots, loadSitemapAnalysis, scanRoutes } from "../../src/cli/walker";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, "..", "fixtures", "cli");

describe("findAppDir", () => {
  it("finds app/ directly under cwd", async () => {
    const result = await findAppDir(path.join(FIXTURES, "appDir-app"));
    expect(result).toBe(path.join(FIXTURES, "appDir-app", "app"));
  });

  it("falls back to src/app when app/ is missing", async () => {
    const result = await findAppDir(path.join(FIXTURES, "appDir-src-app"));
    expect(result).toBe(path.join(FIXTURES, "appDir-src-app", "src", "app"));
  });

  it("throws when neither app/ nor src/app/ exists", async () => {
    await expect(
      findAppDir(path.join(FIXTURES, "appDir-missing")),
    ).rejects.toThrow(/No app\/ directory found/);
  });

  it("uses --dir override when provided", async () => {
    const result = await findAppDir(
      path.join(FIXTURES, "appDir-app"),
      "app",
    );
    expect(result).toBe(path.join(FIXTURES, "appDir-app", "app"));
  });

  it("throws when --dir override is not a directory", async () => {
    await expect(
      findAppDir(path.join(FIXTURES, "appDir-app"), "does-not-exist"),
    ).rejects.toThrow(/not a directory/);
  });
});

describe("findSitemapAndRobots", () => {
  it("finds both sitemap.ts and robots.ts when present", async () => {
    const appDir = path.join(FIXTURES, "appDir-app", "app");
    const result = await findSitemapAndRobots(appDir);
    expect(result.sitemapFile).toBe(path.join(appDir, "sitemap.ts"));
    expect(result.robotsFile).toBe(path.join(appDir, "robots.ts"));
  });

  it("returns nulls when neither exists", async () => {
    const appDir = path.join(FIXTURES, "appDir-src-app", "src", "app");
    const result = await findSitemapAndRobots(appDir);
    expect(result.sitemapFile).toBeNull();
    expect(result.robotsFile).toBeNull();
  });
});

describe("loadSitemapAnalysis", () => {
  it("returns null when sitemapFile is null", async () => {
    expect(await loadSitemapAnalysis(null)).toBeNull();
  });

  it("returns null for non-JS/TS sitemap (e.g. sitemap.xml)", async () => {
    expect(await loadSitemapAnalysis("/fake/app/sitemap.xml")).toBeNull();
  });

  it("parses an existing TS sitemap and returns SitemapAnalysis", async () => {
    const sitemapPath = path.join(FIXTURES, "appDir-app", "app", "sitemap.ts");
    const result = await loadSitemapAnalysis(sitemapPath);
    expect(result).not.toBeNull();
    expect(result?.staticPaths).toEqual(["/"]);
    expect(result?.hasDynamicGeneration).toBe(false);
  });

  it("returns null when the file cannot be read", async () => {
    expect(await loadSitemapAnalysis("/nonexistent/sitemap.ts")).toBeNull();
  });
});

describe("scanRoutes", () => {
  it("finds page files and detects metadata exports", async () => {
    const appDir = path.join(FIXTURES, "appDir-app", "app");
    const routes = await scanRoutes(appDir);

    expect(routes).toHaveLength(3);

    const homepage = routes.find((r) => r.filePath.endsWith("app/page.tsx"));
    const contact = routes.find((r) =>
      r.filePath.endsWith("contact/page.tsx"),
    );
    const blogSlug = routes.find((r) =>
      r.filePath.includes(path.join("blog", "[slug]")),
    );

    expect(homepage?.hasMetadata).toBe(true);
    expect(contact?.hasMetadata).toBe(false);
    expect(blogSlug?.hasMetadata).toBe(false);
  });

  it("populates urlPath and isDynamic", async () => {
    const appDir = path.join(FIXTURES, "appDir-app", "app");
    const routes = await scanRoutes(appDir);

    const homepage = routes.find((r) => r.filePath.endsWith("app/page.tsx"));
    const contact = routes.find((r) =>
      r.filePath.endsWith("contact/page.tsx"),
    );
    const blogSlug = routes.find((r) =>
      r.filePath.includes(path.join("blog", "[slug]")),
    );

    expect(homepage?.urlPath).toBe("/");
    expect(homepage?.isDynamic).toBe(false);

    expect(contact?.urlPath).toBe("/contact");
    expect(contact?.isDynamic).toBe(false);

    expect(blogSlug?.urlPath).toBe("/blog/[slug]");
    expect(blogSlug?.isDynamic).toBe(true);
  });

  it("returns empty array when no page files exist", async () => {
    const emptyDir = path.join(FIXTURES, "appDir-missing");
    const routes = await scanRoutes(emptyDir);
    expect(routes).toEqual([]);
  });
});
