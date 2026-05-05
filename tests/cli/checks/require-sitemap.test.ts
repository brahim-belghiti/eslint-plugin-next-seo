import { describe, expect, it } from "vitest";
import { run } from "../../../src/cli/checks/require-sitemap";
import type { Accumulator } from "../../../src/cli/types";

function buildAcc(overrides: Partial<Accumulator> = {}): Accumulator {
  return {
    appDir: "/fake/app",
    routes: [],
    sitemapFile: null,
    robotsFile: null,
    ...overrides,
  };
}

describe("require-sitemap", () => {
  it("returns no findings when sitemap is present", () => {
    const findings = run(buildAcc({ sitemapFile: "/fake/app/sitemap.ts" }));
    expect(findings).toEqual([]);
  });

  it("returns an error finding when sitemap is absent", () => {
    const findings = run(buildAcc({ sitemapFile: null }));
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      level: "error",
      check: "require-sitemap",
    });
    expect(findings[0]?.message).toMatch(/sitemap\.ts/);
  });
});
