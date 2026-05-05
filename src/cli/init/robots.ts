export type RobotsOptions = {
  baseUrl: string;
};

export function generateRobots(opts: RobotsOptions): string {
  const { baseUrl } = opts;

  return [
    `import type { MetadataRoute } from "next";`,
    ``,
    `const BASE_URL = "${baseUrl}";`,
    ``,
    `export default function robots(): MetadataRoute.Robots {`,
    `  return {`,
    `    rules: {`,
    `      userAgent: "*",`,
    `      allow: "/",`,
    `    },`,
    `    sitemap: \`\${BASE_URL}/sitemap.xml\`,`,
    `  };`,
    `}`,
  ].join("\n");
}
