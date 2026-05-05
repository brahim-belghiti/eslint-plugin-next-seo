#!/usr/bin/env node
import { parseArgs } from "node:util";
import * as metadataCoverage from "./checks/metadata-coverage";
import * as requireRobots from "./checks/require-robots";
import * as requireSitemap from "./checks/require-sitemap";
import { print } from "./reporter";
import type { Accumulator } from "./types";
import { findAppDir, findSitemapAndRobots, scanRoutes } from "./walker";

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    options: { dir: { type: "string" } },
    allowPositionals: true,
  });

  const command = positionals[0];
  if (command !== "check") {
    console.error("Usage: next-seo check [--dir <path>]");
    process.exit(2);
  }

  const appDir = await findAppDir(process.cwd(), values.dir);
  const { sitemapFile, robotsFile } = await findSitemapAndRobots(appDir);
  const routes = await scanRoutes(appDir);

  const acc: Accumulator = { appDir, routes, sitemapFile, robotsFile };

  const findings = [
    ...requireSitemap.run(acc),
    ...requireRobots.run(acc),
    ...metadataCoverage.run(acc),
  ];

  console.log(`next-seo — scanning ${appDir}`);
  console.log("");
  process.exit(print(findings));
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(2);
});
