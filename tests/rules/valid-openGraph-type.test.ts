import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { validOpenGraphType } from "../../src/rules/valid-openGraph-type";

const tester = new RuleTester({
  languageOptions: { parser: tsParser },
});

tester.run("valid-openGraph-type", validOpenGraphType, {
  valid: [
    // No openGraph at all
    {
      code: `export const metadata = { title: "Home" };`,
    },
    // openGraph without type — silent
    {
      code: `export const metadata = { openGraph: { title: "Home" } };`,
    },
    // Valid OG types
    {
      code: `export const metadata = { openGraph: { type: "website" } };`,
    },
    {
      code: `export const metadata = { openGraph: { type: "article" } };`,
    },
    {
      code: `export const metadata = { openGraph: { type: "music.song" } };`,
    },
    {
      code: `export const metadata = { openGraph: { type: "video.movie" } };`,
    },
    // openGraph is a variable — silent
    {
      code: `export const metadata = { openGraph: ogConfig };`,
    },
    // type is a variable — silent
    {
      code: `export const metadata = { openGraph: { type: someVar } };`,
    },
  ],
  invalid: [
    // Unknown type
    {
      code: `export const metadata = { openGraph: { type: "webpage" } };`,
      errors: [{ messageId: "unknownOgType", data: { value: "webpage" } }],
    },
    // Misspelled
    {
      code: `export const metadata = { openGraph: { type: "articles" } };`,
      errors: [{ messageId: "unknownOgType", data: { value: "articles" } }],
    },
    // generateMetadata variant
    {
      code: `export async function generateMetadata() { return { openGraph: { type: "bad" } }; }`,
      errors: [{ messageId: "unknownOgType", data: { value: "bad" } }],
    },
    // Arrow form
    {
      code: `export const generateMetadata = () => ({ openGraph: { type: "bad" } });`,
      errors: [{ messageId: "unknownOgType", data: { value: "bad" } }],
    },
  ],
});
