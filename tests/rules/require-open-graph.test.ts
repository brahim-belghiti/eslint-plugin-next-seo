import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { requireOpenGraph } from "../../src/rules/require-open-graph";

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
  },
});

tester.run("require-open-graph", requireOpenGraph, {
  valid: [
    `export const metadata = { openGraph: { title: "Hello" } };`,
    `export const metadata = { title: "x", openGraph: {} };`,
    `export function generateMetadata() { return { openGraph: {} }; }`,
    `export async function generateMetadata() { return { openGraph: {} }; }`,
    `export const generateMetadata = () => ({ openGraph: {} });`,
    `export const dynamic = "force-dynamic";`,
    `export function generateMetadata() { const m = load(); return m; }`,
  ],
  invalid: [
    {
      code: `export const metadata = {};`,
      errors: [{ messageId: "missingField", data: { field: "openGraph" } }],
    },
    {
      code: `export const metadata = { title: "x", description: "y" };`,
      errors: [{ messageId: "missingField", data: { field: "openGraph" } }],
    },
    {
      code: `export function generateMetadata() { return { title: "x" }; }`,
      errors: [{ messageId: "missingField", data: { field: "openGraph" } }],
    },
    {
      code: `export const generateMetadata = () => ({ title: "x" });`,
      errors: [{ messageId: "missingField", data: { field: "openGraph" } }],
    },
  ],
});
