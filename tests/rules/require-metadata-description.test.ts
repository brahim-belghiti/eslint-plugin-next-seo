import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { requireMetadataDescription } from "../../src/rules/require-metadata-description";

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
  },
});

tester.run("require-metadata-description", requireMetadataDescription, {
  valid: [
    `export const metadata = { description: "Hello" };`,
    `export const metadata = { title: "x", description: "y" };`,
    `export function generateMetadata() { return { description: "Hello" }; }`,
    `export async function generateMetadata() { return { description: "Hello" }; }`,
    `export const generateMetadata = () => ({ description: "Hello" });`,
    `export const dynamic = "force-dynamic";`,
    `export function generateMetadata() { const m = load(); return m; }`,
  ],
  invalid: [
    {
      code: `export const metadata = {};`,
      errors: [{ messageId: "missingField", data: { field: "description" } }],
    },
    {
      code: `export const metadata = { title: "x" };`,
      errors: [{ messageId: "missingField", data: { field: "description" } }],
    },
    {
      code: `export function generateMetadata() { return { title: "x" }; }`,
      errors: [{ messageId: "missingField", data: { field: "description" } }],
    },
    {
      code: `export const generateMetadata = () => ({ title: "x" });`,
      errors: [{ messageId: "missingField", data: { field: "description" } }],
    },
  ],
});
