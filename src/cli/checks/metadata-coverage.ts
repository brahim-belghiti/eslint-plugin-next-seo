import type { Accumulator, Finding } from "../types";

export function run(acc: Accumulator): Finding[] {
  const total = acc.routes.length;
  const withMeta = acc.routes.filter((r) => r.hasMetadata).length;
  return [
    {
      level: "info",
      check: "metadata-coverage",
      message: `${withMeta}/${total} page files export metadata directly.`,
    },
  ];
}
