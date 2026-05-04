import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { metadataTitleLength } from "../../src/rules/metadata-title-length";

const tester = new RuleTester({
  languageOptions: { parser: tsParser },
});

const SHORT = "A".repeat(60);
const LONG = "A".repeat(61);

tester.run("metadata-title-length", metadataTitleLength, {
  valid: [
    // Short string literal
    {
      code: `export const metadata = { title: "${SHORT}" };`,
    },
    // Short via { default }
    {
      code: `export const metadata = { title: { default: "${SHORT}" } };`,
    },
    // Short via { absolute }
    {
      code: `export const metadata = { title: { absolute: "${SHORT}" } };`,
    },
    // No title at all — different rule's job
    {
      code: `export const metadata = { description: "fine" };`,
    },
    // Title is a variable — silent
    {
      code: `export const metadata = { title: someVar };`,
    },
    // Template-only title — silent (substituted value is what renders)
    {
      code: `export const metadata = { title: { template: "%s | Site" } };`,
    },
    // generateMetadata with short title
    {
      code: `export async function generateMetadata() { return { title: "${SHORT}" }; }`,
    },
  ],
  invalid: [
    // 61-char string literal
    {
      code: `export const metadata = { title: "${LONG}" };`,
      errors: [{ messageId: "titleTooLong", data: { length: 61 } }],
    },
    // 61-char via { default }
    {
      code: `export const metadata = { title: { default: "${LONG}" } };`,
      errors: [{ messageId: "titleTooLong", data: { length: 61 } }],
    },
    // 61-char via { absolute }
    {
      code: `export const metadata = { title: { absolute: "${LONG}" } };`,
      errors: [{ messageId: "titleTooLong", data: { length: 61 } }],
    },
    // generateMetadata returning a long title
    {
      code: `export async function generateMetadata() { return { title: "${LONG}" }; }`,
      errors: [{ messageId: "titleTooLong", data: { length: 61 } }],
    },
  ],
});
