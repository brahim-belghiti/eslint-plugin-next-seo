import type { Accumulator, Finding } from "../types";

function dynamicPathRegex(urlPath: string): RegExp {
  const pattern = urlPath
    .split("/")
    .map((seg) => {
      if (/^\[\[\.\.\..+\]\]$/.test(seg)) return "(?:.+)?";
      if (/^\[\.\.\..+\]$/.test(seg)) return ".+";
      if (/^\[.+\]$/.test(seg)) return "[^/]+";
      return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return new RegExp(`^${pattern}$`);
}

export function run(acc: Accumulator): Finding[] {
  if (!acc.sitemapFile || !acc.sitemapAnalysis) return [];

  const findings: Finding[] = [];
  const { staticPaths, hasDynamicGeneration } = acc.sitemapAnalysis;
  const sitemapPathSet = new Set(staticPaths);

  const routeUrlPathSet = new Set(acc.routes.map((r) => r.urlPath));
  const dynamicPatterns = acc.routes
    .filter((r) => r.isDynamic)
    .map((r) => dynamicPathRegex(r.urlPath));

  for (const route of acc.routes) {
    if (route.isDynamic) continue;
    if (sitemapPathSet.has(route.urlPath)) continue;
    if (hasDynamicGeneration) continue;
    findings.push({
      level: "error",
      check: "sitemap-route-mismatch",
      message: `Static route "${route.urlPath}" exists in app/ but is missing from sitemap.ts`,
      file: route.filePath,
    });
  }

  for (const sitemapPath of staticPaths) {
    if (routeUrlPathSet.has(sitemapPath)) continue;
    if (dynamicPatterns.some((re) => re.test(sitemapPath))) continue;
    findings.push({
      level: "error",
      check: "sitemap-route-mismatch",
      message: `sitemap.ts references "${sitemapPath}" but no matching page exists in app/`,
      file: acc.sitemapFile,
    });
  }

  if (hasDynamicGeneration) {
    findings.push({
      level: "info",
      check: "sitemap-route-mismatch",
      message:
        "sitemap.ts contains dynamic entries; not all paths could be statically verified",
      file: acc.sitemapFile,
    });
  }

  return findings;
}
