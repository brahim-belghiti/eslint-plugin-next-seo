import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { noEmptyMetadataFields } from "../../src/rules/no-empty-metadata-fields";

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
  },
});

tester.run("no-empty-metadata-fields", noEmptyMetadataFields, {
  valid: [
    `export const metadata = { title: "Hello" };`,
    `export const metadata = { title: "Hello", description: "World" };`,
    `export const metadata = {};`,
    `export const metadata = { title: { template: "%s | App", default: "App" } };`,
    `export function generateMetadata() { return { title: "x" }; }`,
    `export const dynamic = "force-dynamic";`,
    `export function generateMetadata() { const m = load(); return m; }`,
  ],
  invalid: [
    {
      code: `export const metadata = { title: "" };`,
      errors: [{ messageId: "emptyField", data: { field: "title" } }],
    },
    {
      code: `export const metadata = { description: "" };`,
      errors: [{ messageId: "emptyField", data: { field: "description" } }],
    },
    {
      code: "export const metadata = { title: `` };",
      errors: [{ messageId: "emptyField", data: { field: "title" } }],
    },
    {
      code: `export const metadata = { title: "   " };`,
      errors: [{ messageId: "emptyField", data: { field: "title" } }],
    },
    {
      code: `export const metadata = { title: "", description: "" };`,
      errors: [
        { messageId: "emptyField", data: { field: "title" } },
        { messageId: "emptyField", data: { field: "description" } },
      ],
    },
    {
      code: `export function generateMetadata() { return { title: "" }; }`,
      errors: [{ messageId: "emptyField", data: { field: "title" } }],
    },
  ],
});
