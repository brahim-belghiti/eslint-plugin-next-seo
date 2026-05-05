import path from "node:path";

export function filePathToUrlPath(filePath: string, appDir: string): string {
  const relative = path.relative(appDir, filePath);
  const withoutPage = relative.replace(/[/\\]?page\.(tsx|ts|jsx|js)$/, "");
  const segments = withoutPage.split(/[/\\]/).filter((seg) => {
    if (seg === "") return false;
    if (/^\(.+\)$/.test(seg)) return false;
    if (seg.startsWith("@")) return false;
    return true;
  });
  return segments.length === 0 ? "/" : "/" + segments.join("/");
}

export function isDynamicPath(urlPath: string): boolean {
  return urlPath.split("/").some((seg) => /^\[.+\]$/.test(seg));
}
