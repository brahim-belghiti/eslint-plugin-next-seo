import path from "node:path";
import { describe, expect, it } from "vitest";
import { filePathToUrlPath, isDynamicPath } from "../../src/cli/route-paths";

const APP = "/project/app";

function p(...segments: string[]): string {
  return path.join(APP, ...segments);
}

describe("filePathToUrlPath", () => {
  it("root page.tsx → /", () => {
    expect(filePathToUrlPath(p("page.tsx"), APP)).toBe("/");
  });

  it("nested page.tsx → /about", () => {
    expect(filePathToUrlPath(p("about", "page.tsx"), APP)).toBe("/about");
  });

  it("route group stripped → /pricing", () => {
    expect(filePathToUrlPath(p("(marketing)", "pricing", "page.tsx"), APP)).toBe("/pricing");
  });

  it("parallel slot stripped → /login", () => {
    expect(filePathToUrlPath(p("@modal", "login", "page.tsx"), APP)).toBe("/login");
  });

  it("dynamic segment preserved → /blog/[slug]", () => {
    expect(filePathToUrlPath(p("blog", "[slug]", "page.tsx"), APP)).toBe("/blog/[slug]");
  });

  it("catch-all segment preserved → /blog/[...rest]", () => {
    expect(filePathToUrlPath(p("blog", "[...rest]", "page.tsx"), APP)).toBe("/blog/[...rest]");
  });

  it("route group + dynamic → /[id]", () => {
    expect(filePathToUrlPath(p("(group)", "[id]", "page.tsx"), APP)).toBe("/[id]");
  });
});

describe("isDynamicPath", () => {
  it("static paths are not dynamic", () => {
    expect(isDynamicPath("/")).toBe(false);
    expect(isDynamicPath("/about")).toBe(false);
    expect(isDynamicPath("/pricing")).toBe(false);
  });

  it("paths with [param] segments are dynamic", () => {
    expect(isDynamicPath("/blog/[slug]")).toBe(true);
    expect(isDynamicPath("/blog/[...rest]")).toBe(true);
    expect(isDynamicPath("/[id]")).toBe(true);
  });
});
