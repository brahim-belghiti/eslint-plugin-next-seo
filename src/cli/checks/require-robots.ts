import type { Accumulator, Finding } from "../types";

export function run(acc: Accumulator): Finding[] {
  if (acc.robotsFile) return [];
  return [
    {
      level: "error",
      check: "require-robots",
      message:
        "No `robots.ts` found. Add `app/robots.ts` to declare crawler directives.",
    },
  ];
}
