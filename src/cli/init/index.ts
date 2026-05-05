import fs from "node:fs/promises";
import path from "node:path";
import { generateRobots } from "./robots";
import { generateSitemap } from "./sitemap";
import type { RouteInfo } from "../types";

export type InitTarget = "sitemap" | "robots" | "both";

export type InitOptions = {
  appDir: string;
  baseUrl: string;
  target: InitTarget;
  dryRun: boolean;
  force: boolean;
};

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function runInit(opts: InitOptions, routes: RouteInfo[]): Promise<number> {
  const { appDir, baseUrl, target, dryRun, force } = opts;

  const staticPaths = routes.filter((r) => !r.isDynamic).map((r) => r.urlPath);
  const dynamicPaths = routes.filter((r) => r.isDynamic).map((r) => r.urlPath);

  let exitCode = 0;

  const targets: Array<"sitemap" | "robots"> =
    target === "both" ? ["sitemap", "robots"] : [target];

  for (const t of targets) {
    const destPath = path.join(appDir, `${t}.ts`);
    const exists = await fileExists(destPath);

    if (exists && !force && !dryRun) {
      console.error(`next-seo: ${destPath} already exists. Use --force to overwrite.`);
      exitCode = 1;
      continue;
    }

    const content =
      t === "sitemap"
        ? generateSitemap({ baseUrl, staticPaths, dynamicPaths })
        : generateRobots({ baseUrl });

    if (dryRun) {
      console.log(`--- ${destPath} ---`);
      console.log(content);
      console.log("");
    } else {
      await fs.writeFile(destPath, content, "utf8");
      if (t === "sitemap") {
        console.log(`✓ Wrote ${destPath} (${staticPaths.length} static, ${dynamicPaths.length} dynamic)`);
      } else {
        console.log(`✓ Wrote ${destPath}`);
      }
    }
  }

  return exitCode;
}
