import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findAppDir, findSitemapAndRobots, scanRoutes } from "../../src/cli/walker";

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

describe("scanRoutes", () => {
  it("finds page files and detects metadata exports", async () => {
    const appDir = path.join(FIXTURES, "appDir-app", "app");
    const routes = await scanRoutes(appDir);

    expect(routes).toHaveLength(2);

    const homepage = routes.find((r) => r.filePath.endsWith("app/page.tsx"));
    const contact = routes.find((r) =>
      r.filePath.endsWith("contact/page.tsx"),
    );

    expect(homepage?.hasMetadata).toBe(true);
    expect(contact?.hasMetadata).toBe(false);
  });

  it("returns empty array when no page files exist", async () => {
    const appDir = path.join(FIXTURES, "appDir-app", "app", "contact");
    // contact/ has page.tsx — wrong assertion. Use a directory with no pages.
    // Use the sitemap-only path: there is no nested app dir there.
    const emptyDir = path.join(FIXTURES, "appDir-missing");
    const routes = await scanRoutes(emptyDir);
    expect(routes).toEqual([]);
    // Also verify the scoped contact/ does have one
    const scoped = await scanRoutes(appDir);
    expect(scoped.map((r) => r.filePath.endsWith("contact/page.tsx"))).toContain(
      true,
    );
  });
});
