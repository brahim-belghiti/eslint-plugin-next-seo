import { describe, expect, it } from "vitest";
import { run } from "../../../src/cli/checks/require-robots";
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

describe("require-robots", () => {
  it("returns no findings when robots is present", () => {
    const findings = run(buildAcc({ robotsFile: "/fake/app/robots.ts" }));
    expect(findings).toEqual([]);
  });

  it("returns an error finding when robots is absent", () => {
    const findings = run(buildAcc({ robotsFile: null }));
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      level: "error",
      check: "require-robots",
    });
    expect(findings[0]?.message).toMatch(/robots\.ts/);
  });
});
