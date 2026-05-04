import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { metadataKeywordsShape } from "../../src/rules/metadata-keywords-shape";

const tester = new RuleTester({
  languageOptions: { parser: tsParser },
});

tester.run("metadata-keywords-shape", metadataKeywordsShape, {
  valid: [
    // No keywords
    {
      code: `export const metadata = { title: "Home" };`,
    },
    // Array form — correct
    {
      code: `export const metadata = { keywords: ["seo", "nextjs"] };`,
    },
    // Variable reference — silent
    {
      code: `export const metadata = { keywords: someVar };`,
    },
    // Expression — silent
    {
      code: `export const metadata = { keywords: getKeywords() };`,
    },
  ],
  invalid: [
    // String form
    {
      code: `export const metadata = { keywords: "seo, nextjs" };`,
      errors: [{ messageId: "stringKeywords" }],
    },
    // generateMetadata returning string keywords
    {
      code: `export async function generateMetadata() { return { keywords: "seo, nextjs" }; }`,
      errors: [{ messageId: "stringKeywords" }],
    },
    // Arrow form
    {
      code: `export const generateMetadata = () => ({ keywords: "seo, nextjs, app-router" });`,
      errors: [{ messageId: "stringKeywords" }],
    },
  ],
});
