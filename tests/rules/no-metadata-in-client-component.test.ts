import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { noMetadataInClientComponent } from "../../src/rules/no-metadata-in-client-component";

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run("no-metadata-in-client-component", noMetadataInClientComponent, {
  valid: [
    // Server component with metadata — no "use client"
    {
      code: `export const metadata = { title: "Home" };`,
    },
    // Client component with no metadata
    {
      code: `"use client"; export default function Page() { return <div />; }`,
    },
    // Client component with other exports — not metadata
    {
      code: `"use client"; export const config = { runtime: "edge" };`,
    },
    // "use client" mid-file (not in directive prologue) — silent
    {
      code: `
        export const metadata = { title: "Home" };
        "use client";
      `,
    },
  ],
  invalid: [
    // "use client" + export const metadata
    {
      code: `"use client";\nexport const metadata = { title: "Home" };`,
      errors: [{ messageId: "metadataInClientComponent" }],
    },
    // "use client" + export function generateMetadata
    {
      code: `"use client";\nexport function generateMetadata() { return { title: "Home" }; }`,
      errors: [{ messageId: "metadataInClientComponent" }],
    },
    // "use client" + export const generateMetadata arrow
    {
      code: `"use client";\nexport const generateMetadata = () => ({ title: "Home" });`,
      errors: [{ messageId: "metadataInClientComponent" }],
    },
  ],
});
