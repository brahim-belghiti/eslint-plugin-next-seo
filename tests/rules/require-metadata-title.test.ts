import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { requireMetadataTitle } from "../../src/rules/require-metadata-title";

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
  },
});

tester.run("require-metadata-title", requireMetadataTitle, {
  valid: [
    `export const metadata = { title: "Hello" };`,
    `export const metadata = { title: "Hello", description: "World" };`,
    `export function generateMetadata() { return { title: "Hello" }; }`,
    `export async function generateMetadata() { return { title: "Hello" }; }`,
    `export const generateMetadata = () => ({ title: "Hello" });`,
    `export const dynamic = "force-dynamic";`,
    `export function generateMetadata() { const m = load(); return m; }`,
  ],
  invalid: [
    {
      code: `export const metadata = {};`,
      errors: [{ messageId: "missingField", data: { field: "title" } }],
    },
    {
      code: `export const metadata = { description: "x" };`,
      errors: [{ messageId: "missingField", data: { field: "title" } }],
    },
    {
      code: `export function generateMetadata() { return { description: "x" }; }`,
      errors: [{ messageId: "missingField", data: { field: "title" } }],
    },
    {
      code: `export const generateMetadata = () => ({ description: "x" });`,
      errors: [{ messageId: "missingField", data: { field: "title" } }],
    },
  ],
});
