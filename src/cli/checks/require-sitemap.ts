import type { Accumulator, Finding } from "../types";

export function run(acc: Accumulator): Finding[] {
  if (acc.sitemapFile) return [];
  return [
    {
      level: "error",
      check: "require-sitemap",
      message:
        "No `sitemap.ts` found. Add `app/sitemap.ts` so search engines can discover all routes.",
    },
  ];
}
