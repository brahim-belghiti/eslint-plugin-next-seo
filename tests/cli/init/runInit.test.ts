import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runInit } from "../../../src/cli/init/index";
import type { RouteInfo } from "../../../src/cli/types";

const staticRoute = (urlPath: string): RouteInfo => ({
  filePath: `/fake/app${urlPath}/page.tsx`,
  hasMetadata: false,
  urlPath,
  isDynamic: false,
});

const dynamicRoute = (urlPath: string): RouteInfo => ({
  filePath: `/fake/app${urlPath}/page.tsx`,
  hasMetadata: false,
  urlPath,
  isDynamic: true,
});

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "next-seo-test-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("runInit", () => {
  it("dry-run prints content without writing files", async () => {
    const logged: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      logged.push(args.join(" "));
    });

    const code = await runInit(
      { appDir: tmpDir, baseUrl: "https://example.com", target: "both", dryRun: true, force: false },
      [staticRoute("/"), staticRoute("/about")],
    );

    vi.restoreAllMocks();

    expect(code).toBe(0);
    const sitemapExists = await fs.access(path.join(tmpDir, "sitemap.ts")).then(() => true).catch(() => false);
    const robotsExists = await fs.access(path.join(tmpDir, "robots.ts")).then(() => true).catch(() => false);
    expect(sitemapExists).toBe(false);
    expect(robotsExists).toBe(false);

    const output = logged.join("\n");
    expect(output).toContain("sitemap.ts");
    expect(output).toContain("robots.ts");
    expect(output).toContain("`${BASE_URL}/about`");
  });

  it("writes sitemap.ts and robots.ts when files do not exist", async () => {
    const code = await runInit(
      { appDir: tmpDir, baseUrl: "https://example.com", target: "both", dryRun: false, force: false },
      [staticRoute("/"), staticRoute("/about"), dynamicRoute("/blog/[slug]")],
    );

    expect(code).toBe(0);

    const sitemap = await fs.readFile(path.join(tmpDir, "sitemap.ts"), "utf8");
    const robots = await fs.readFile(path.join(tmpDir, "robots.ts"), "utf8");

    expect(sitemap).toContain("`${BASE_URL}/about`");
    expect(sitemap).toContain("TODO: dynamic route detected at /blog/[slug]");
    expect(robots).toContain('userAgent: "*"');
  });

  it("returns exit code 1 and skips when files exist and no --force", async () => {
    await fs.writeFile(path.join(tmpDir, "sitemap.ts"), "existing", "utf8");

    const errored: string[] = [];
    vi.spyOn(console, "error").mockImplementation((...args) => {
      errored.push(args.join(" "));
    });

    const code = await runInit(
      { appDir: tmpDir, baseUrl: "https://example.com", target: "sitemap", dryRun: false, force: false },
      [staticRoute("/")],
    );

    vi.restoreAllMocks();

    expect(code).toBe(1);
    expect(errored.join("\n")).toContain("already exists");
    const content = await fs.readFile(path.join(tmpDir, "sitemap.ts"), "utf8");
    expect(content).toBe("existing");
  });

  it("overwrites existing files when --force is set", async () => {
    await fs.writeFile(path.join(tmpDir, "sitemap.ts"), "old content", "utf8");

    const code = await runInit(
      { appDir: tmpDir, baseUrl: "https://example.com", target: "sitemap", dryRun: false, force: true },
      [staticRoute("/")],
    );

    expect(code).toBe(0);
    const content = await fs.readFile(path.join(tmpDir, "sitemap.ts"), "utf8");
    expect(content).not.toBe("old content");
    expect(content).toContain("MetadataRoute.Sitemap");
  });

  it("target: sitemap only writes sitemap.ts", async () => {
    const code = await runInit(
      { appDir: tmpDir, baseUrl: "https://example.com", target: "sitemap", dryRun: false, force: false },
      [staticRoute("/")],
    );

    expect(code).toBe(0);
    const sitemapExists = await fs.access(path.join(tmpDir, "sitemap.ts")).then(() => true).catch(() => false);
    const robotsExists = await fs.access(path.join(tmpDir, "robots.ts")).then(() => true).catch(() => false);
    expect(sitemapExists).toBe(true);
    expect(robotsExists).toBe(false);
  });

  it("target: robots only writes robots.ts", async () => {
    const code = await runInit(
      { appDir: tmpDir, baseUrl: "https://example.com", target: "robots", dryRun: false, force: false },
      [],
    );

    expect(code).toBe(0);
    const sitemapExists = await fs.access(path.join(tmpDir, "sitemap.ts")).then(() => true).catch(() => false);
    const robotsExists = await fs.access(path.join(tmpDir, "robots.ts")).then(() => true).catch(() => false);
    expect(sitemapExists).toBe(false);
    expect(robotsExists).toBe(true);
  });
});
