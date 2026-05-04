import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { metadataDescriptionLength } from "../../src/rules/metadata-description-length";

const tester = new RuleTester({
  languageOptions: { parser: tsParser },
});

const SHORT = "A".repeat(160);
const LONG = "A".repeat(161);

tester.run("metadata-description-length", metadataDescriptionLength, {
  valid: [
    // Exactly at threshold
    {
      code: `export const metadata = { description: "${SHORT}" };`,
    },
    // No description — different rule's job
    {
      code: `export const metadata = { title: "fine" };`,
    },
    // Variable reference — silent
    {
      code: `export const metadata = { description: someVar };`,
    },
    // generateMetadata with short description
    {
      code: `export async function generateMetadata() { return { description: "${SHORT}" }; }`,
    },
    // Arrow function generateMetadata
    {
      code: `export const generateMetadata = () => ({ description: "${SHORT}" });`,
    },
    // Sync function declaration
    {
      code: `export function generateMetadata() { return { description: "${SHORT}" }; }`,
    },
  ],
  invalid: [
    // 161-char string literal
    {
      code: `export const metadata = { description: "${LONG}" };`,
      errors: [{ messageId: "descriptionTooLong", data: { length: 161 } }],
    },
    // generateMetadata returning long description
    {
      code: `export async function generateMetadata() { return { description: "${LONG}" }; }`,
      errors: [{ messageId: "descriptionTooLong", data: { length: 161 } }],
    },
    // Arrow form
    {
      code: `export const generateMetadata = () => ({ description: "${LONG}" });`,
      errors: [{ messageId: "descriptionTooLong", data: { length: 161 } }],
    },
    // Sync function form
    {
      code: `export function generateMetadata() { return { description: "${LONG}" }; }`,
      errors: [{ messageId: "descriptionTooLong", data: { length: 161 } }],
    },
  ],
});
