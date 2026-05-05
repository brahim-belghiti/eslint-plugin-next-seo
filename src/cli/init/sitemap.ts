export type SitemapOptions = {
  baseUrl: string;
  staticPaths: string[];
  dynamicPaths: string[];
};

function extractDynSegment(dynamicPath: string): string {
  const raw = dynamicPath.split("/").find((s) => s.startsWith("[")) ?? "[param]";
  return raw.replace(/^\[\.\.\./, "").replace(/^\[/, "").replace(/\]$/, "");
}

function todoBlock(dynamicPath: string): string {
  const firstDynSegment = extractDynSegment(dynamicPath);
  const prefix = (dynamicPath.split("/[")[0] ?? "").replace(/^\//, "") || firstDynSegment;
  const varName = prefix + "Entries";
  const exampleSlug = dynamicPath.replace(/\/\[.*?\]$/, "").replace(/^\//, "");
  const urlSuffix = exampleSlug ? `/${exampleSlug}/\${p.${firstDynSegment}}` : `/\${p.${firstDynSegment}}`;

  return [
    `  // TODO: dynamic route detected at ${dynamicPath}`,
    `  // Wire your data source and uncomment:`,
    `  // const ${varName} = (await get${capitalize(prefix)}()).map((p) => ({`,
    `  //   url: \`\${BASE_URL}${urlSuffix}\`,`,
    `  //   lastModified: new Date(),`,
    `  //   changeFrequency: "weekly" as const,`,
    `  //   priority: 0.7,`,
    `  // }));`,
  ].join("\n");
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateSitemap(opts: SitemapOptions): string {
  const { baseUrl, staticPaths, dynamicPaths } = opts;

  const staticArray =
    staticPaths.length === 0
      ? "[]"
      : "[\n" + staticPaths.map((p) => `  "${p}",`).join("\n") + "\n]";

  const staticMapping = [
    `  const staticEntries = staticRoutes.map((route) => ({`,
    `    url: \`\${BASE_URL}\${route === "/" ? "" : route}\`,`,
    `    lastModified: new Date(),`,
    `    changeFrequency: "weekly" as const,`,
    `    priority: route === "/" ? 1.0 : 0.8,`,
    `  }));`,
  ].join("\n");

  const todoParts = dynamicPaths.map(todoBlock);

  const spreadNames = dynamicPaths.map((dp) => {
    const firstDynSegment = extractDynSegment(dp);
    const prefix = (dp.split("/[")[0] ?? "").replace(/^\//, "") || firstDynSegment;
    return prefix + "Entries";
  });

  const returnSpreads =
    dynamicPaths.length === 0
      ? `    ...staticEntries,`
      : `    ...staticEntries,\n` +
        spreadNames.map((n) => `    // ...${n},`).join("\n");

  const lines = [
    `import type { MetadataRoute } from "next";`,
    ``,
    `const BASE_URL = "${baseUrl}";`,
    ``,
    `const staticRoutes = ${staticArray};`,
    ``,
    `export default async function sitemap(): Promise<MetadataRoute.Sitemap> {`,
    staticMapping,
    ``,
    ...(todoParts.length > 0 ? [...todoParts.map((t) => t + "\n"), ``] : []),
    `  return [`,
    `${returnSpreads}`,
    `  ];`,
    `}`,
  ];

  return lines.join("\n");
}
