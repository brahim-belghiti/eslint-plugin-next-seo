import type { Finding } from "./types";

const SYMBOLS = {
  error: "✖",
  warn: "⚠",
  info: "•",
} as const;

export function print(findings: Finding[]): number {
  let errors = 0;
  let warnings = 0;

  for (const f of findings) {
    const symbol = SYMBOLS[f.level];
    const location = f.file ? ` ${f.file}` : "";
    console.log(`  ${symbol} ${f.check}${location}  ${f.message}`);

    if (f.level === "error") errors++;
    if (f.level === "warn") warnings++;
  }

  console.log("");
  console.log(`Summary: ${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}`);

  return errors > 0 ? 1 : 0;
}
