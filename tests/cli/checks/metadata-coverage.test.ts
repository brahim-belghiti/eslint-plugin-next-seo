import { describe, expect, it } from "vitest";
import { run } from "../../../src/cli/checks/metadata-coverage";
import type { Accumulator } from "../../../src/cli/types";

function buildAcc(overrides: Partial<Accumulator> = {}): Accumulator {
  return {
    appDir: "/fake/app",
    routes: [],
    sitemapFile: null,
    sitemapAnalysis: null,
    robotsFile: null,
    ...overrides,
  };
}

describe("metadata-coverage", () => {
  it("reports 0/0 when no routes scanned", () => {
    const findings = run(buildAcc());
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      level: "info",
      check: "metadata-coverage",
    });
    expect(findings[0]?.message).toMatch(/0\/0/);
  });

  it("reports the ratio of routes with metadata", () => {
    const findings = run(
      buildAcc({
        routes: [
          { filePath: "/a/page.tsx", hasMetadata: true, urlPath: "/a", isDynamic: false },
          { filePath: "/b/page.tsx", hasMetadata: false, urlPath: "/b", isDynamic: false },
          { filePath: "/c/page.tsx", hasMetadata: true, urlPath: "/c", isDynamic: false },
        ],
      }),
    );
    expect(findings[0]?.message).toMatch(/2\/3/);
  });

  it("reports all routes covered when every page has metadata", () => {
    const findings = run(
      buildAcc({
        routes: [
          { filePath: "/a/page.tsx", hasMetadata: true, urlPath: "/a", isDynamic: false },
          { filePath: "/b/page.tsx", hasMetadata: true, urlPath: "/b", isDynamic: false },
        ],
      }),
    );
    expect(findings[0]?.message).toMatch(/2\/2/);
  });
});
