import { describe, expect, it } from "vitest";
import { generateRobots } from "../../../src/cli/init/robots";

describe("generateRobots", () => {
  it("contains the MetadataRoute.Robots return type", () => {
    const out = generateRobots({ baseUrl: "https://example.com" });
    expect(out).toContain("MetadataRoute.Robots");
  });

  it("contains userAgent wildcard and allow /", () => {
    const out = generateRobots({ baseUrl: "https://example.com" });
    expect(out).toContain('userAgent: "*"');
    expect(out).toContain('allow: "/"');
  });

  it("contains the sitemap URL built from baseUrl", () => {
    const out = generateRobots({ baseUrl: "https://example.com" });
    expect(out).toContain("${BASE_URL}/sitemap.xml");
    expect(out).toContain('const BASE_URL = "https://example.com"');
  });

  it("uses a custom baseUrl", () => {
    const out = generateRobots({ baseUrl: "https://mysite.io" });
    expect(out).toContain('const BASE_URL = "https://mysite.io"');
  });

  it("exports a default robots function", () => {
    const out = generateRobots({ baseUrl: "https://example.com" });
    expect(out).toContain("export default function robots()");
  });

  it("imports MetadataRoute from next", () => {
    const out = generateRobots({ baseUrl: "https://example.com" });
    expect(out).toContain('import type { MetadataRoute } from "next"');
  });
});
