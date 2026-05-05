#!/usr/bin/env node
import { parseArgs } from "node:util";
import * as metadataCoverage from "./checks/metadata-coverage";
import * as requireRobots from "./checks/require-robots";
import * as requireSitemap from "./checks/require-sitemap";
import { runInit } from "./init/index";
import { print } from "./reporter";
import type { Accumulator, } from "./types";
import type { InitTarget } from "./init/index";
import { findAppDir, findSitemapAndRobots, loadSitemapAnalysis, scanRoutes } from "./walker";

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    options: {
      dir: { type: "string" },
      "base-url": { type: "string" },
      "dry-run": { type: "boolean", default: false },
      force: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  const command = positionals[0];

  if (command === "check") {
    const appDir = await findAppDir(process.cwd(), values.dir);
    const { sitemapFile, robotsFile } = await findSitemapAndRobots(appDir);
    const sitemapAnalysis = await loadSitemapAnalysis(sitemapFile);
    const routes = await scanRoutes(appDir);

    const acc: Accumulator = { appDir, routes, sitemapFile, sitemapAnalysis, robotsFile };

    const findings = [
      ...requireSitemap.run(acc),
      ...requireRobots.run(acc),
      ...metadataCoverage.run(acc),
    ];

    console.log(`next-seo — scanning ${appDir}`);
    console.log("");
    process.exit(print(findings));
  } else if (command === "init") {
    const subTarget = positionals[1];
    const target: InitTarget =
      subTarget === "sitemap" ? "sitemap" :
      subTarget === "robots"  ? "robots"  :
      subTarget === undefined ? "both"    :
      (() => { throw new Error(`Unknown init target: ${subTarget}`); })();

    const appDir = await findAppDir(process.cwd(), values.dir);
    const routes = await scanRoutes(appDir);
    const baseUrl = values["base-url"] ?? "https://example.com";

    process.exit(await runInit(
      { appDir, baseUrl, target, dryRun: values["dry-run"]!, force: values.force! },
      routes,
    ));
  } else {
    console.error(
      "Usage: next-seo check|init [sitemap|robots] [--dir <path>] [--base-url <url>] [--dry-run] [--force]",
    );
    process.exit(2);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(2);
});
