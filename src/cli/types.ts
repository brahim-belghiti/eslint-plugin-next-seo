export type Severity = "error" | "warn" | "info";

export type Finding = {
  level: Severity;
  check: string;
  message: string;
  file?: string;
};

export type RouteInfo = {
  filePath: string;
  hasMetadata: boolean;
};

export type Accumulator = {
  appDir: string;
  routes: RouteInfo[];
  sitemapFile: string | null;
  robotsFile: string | null;
};
