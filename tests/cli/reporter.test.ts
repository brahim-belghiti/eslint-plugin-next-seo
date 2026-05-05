import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { print } from "../../src/cli/reporter";
import type { Finding } from "../../src/cli/types";

describe("reporter", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  function getOutput(): string {
    return logSpy.mock.calls.map((args) => args.join(" ")).join("\n");
  }

  it("returns exit code 0 when no findings", () => {
    const code = print([]);
    expect(code).toBe(0);
    expect(getOutput()).toMatch(/Summary: 0 errors, 0 warnings/);
  });

  it("returns exit code 1 when any error finding", () => {
    const findings: Finding[] = [
      { level: "error", check: "require-sitemap", message: "no sitemap" },
    ];
    const code = print(findings);
    expect(code).toBe(1);
    expect(getOutput()).toMatch(/✖ require-sitemap/);
    expect(getOutput()).toMatch(/Summary: 1 error, 0 warnings/);
  });

  it("returns exit code 0 when only warnings", () => {
    const findings: Finding[] = [
      { level: "warn", check: "soft-rule", message: "watch out" },
    ];
    const code = print(findings);
    expect(code).toBe(0);
    expect(getOutput()).toMatch(/⚠ soft-rule/);
    expect(getOutput()).toMatch(/Summary: 0 errors, 1 warning/);
  });

  it("renders info findings with the bullet symbol", () => {
    const findings: Finding[] = [
      {
        level: "info",
        check: "metadata-coverage",
        message: "3/5 page files export metadata directly.",
      },
    ];
    const code = print(findings);
    expect(code).toBe(0);
    expect(getOutput()).toMatch(/• metadata-coverage/);
    expect(getOutput()).toMatch(/3\/5/);
  });

  it("includes file path when provided", () => {
    const findings: Finding[] = [
      {
        level: "warn",
        check: "soft-rule",
        message: "be careful",
        file: "/abs/app/page.tsx",
      },
    ];
    print(findings);
    expect(getOutput()).toMatch(/\/abs\/app\/page\.tsx/);
  });

  it("counts pluralization correctly", () => {
    const findings: Finding[] = [
      { level: "error", check: "a", message: "x" },
      { level: "error", check: "b", message: "y" },
      { level: "warn", check: "c", message: "z" },
    ];
    const code = print(findings);
    expect(code).toBe(1);
    expect(getOutput()).toMatch(/Summary: 2 errors, 1 warning\b/);
  });
});
