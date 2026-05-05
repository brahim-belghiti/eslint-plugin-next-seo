import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "@typescript-eslint/parser";
import { findMetadataExport } from "../utils/metadata";
import { filePathToUrlPath, isDynamicPath } from "./route-paths";
import { parseSitemap } from "./sitemap-parse";
import type { RouteInfo, SitemapAnalysis } from "./types";

const PAGE_FILE_RE = /^page\.(tsx|ts|jsx|js)$/;
const SITEMAP_FILE_RE = /^sitemap\.(tsx|ts|xml)$/;
const ROBOTS_FILE_RE = /^robots\.(tsx|ts|txt)$/;

async function isDirectory(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function findAppDir(cwd: string, override?: string): Promise<string> {
  if (override) {
    const resolved = path.resolve(cwd, override);
    if (!(await isDirectory(resolved))) {
      throw new Error(`--dir target is not a directory: ${resolved}`);
    }
    return resolved;
  }

  const candidates = [path.join(cwd, "app"), path.join(cwd, "src", "app")];
  for (const candidate of candidates) {
    if (await isDirectory(candidate)) return candidate;
  }

  throw new Error(
    "No app/ directory found. Use --dir to specify a custom location.",
  );
}

export async function findSitemapAndRobots(
  appDir: string,
): Promise<{ sitemapFile: string | null; robotsFile: string | null }> {
  const entries = await fs.readdir(appDir, { withFileTypes: true });

  let sitemapFile: string | null = null;
  let robotsFile: string | null = null;

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!sitemapFile && SITEMAP_FILE_RE.test(entry.name)) {
      sitemapFile = path.join(appDir, entry.name);
    }
    if (!robotsFile && ROBOTS_FILE_RE.test(entry.name)) {
      robotsFile = path.join(appDir, entry.name);
    }
  }

  return { sitemapFile, robotsFile };
}

export async function loadSitemapAnalysis(
  sitemapFile: string | null,
): Promise<SitemapAnalysis | null> {
  if (!sitemapFile) return null;
  if (!/\.(tsx|ts|jsx|js)$/.test(sitemapFile)) return null;
  try {
    const source = await fs.readFile(sitemapFile, "utf8");
    return parseSitemap(source);
  } catch {
    return null;
  }
}

async function collectPageFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectPageFiles(fullPath)));
    } else if (entry.isFile() && PAGE_FILE_RE.test(entry.name)) {
      out.push(fullPath);
    }
  }
  return out;
}

export async function scanRoutes(appDir: string): Promise<RouteInfo[]> {
  const pageFiles = await collectPageFiles(appDir);
  const routes: RouteInfo[] = [];

  for (const filePath of pageFiles) {
    const source = await fs.readFile(filePath, "utf8");
    let hasMetadata = false;
    try {
      const ast = parse(source, {
        ecmaVersion: "latest",
        sourceType: "module",
        jsx: true,
        loc: true,
        range: true,
      });
      const result = findMetadataExport(ast);
      hasMetadata = result !== null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`next-seo: failed to parse ${filePath}: ${msg}`);
    }
    const urlPath = filePathToUrlPath(filePath, appDir);
    routes.push({ filePath, hasMetadata, urlPath, isDynamic: isDynamicPath(urlPath) });
  }

  routes.sort((a, b) => a.filePath.localeCompare(b.filePath));
  return routes;
}
