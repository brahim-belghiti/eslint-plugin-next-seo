import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { validTwitterCard } from "../../src/rules/valid-twitter-card";

const tester = new RuleTester({
  languageOptions: { parser: tsParser },
});

tester.run("valid-twitter-card", validTwitterCard, {
  valid: [
    // No twitter at all
    {
      code: `export const metadata = { title: "Home" };`,
    },
    // twitter without card — spec defaults to summary
    {
      code: `export const metadata = { twitter: { title: "Home" } };`,
    },
    // Valid card values
    {
      code: `export const metadata = { twitter: { card: "summary" } };`,
    },
    {
      code: `export const metadata = { twitter: { card: "summary_large_image" } };`,
    },
    {
      code: `export const metadata = { twitter: { card: "app" } };`,
    },
    {
      code: `export const metadata = { twitter: { card: "player" } };`,
    },
    // twitter is a variable reference — silent
    {
      code: `export const metadata = { twitter: twitterConfig };`,
    },
    // card is a variable reference — silent
    {
      code: `export const metadata = { twitter: { card: someVar } };`,
    },
  ],
  invalid: [
    // Typo / unknown card value
    {
      code: `export const metadata = { twitter: { card: "summary_large_image_card" } };`,
      errors: [{ messageId: "unknownCard", data: { value: "summary_large_image_card" } }],
    },
    // Completely wrong value
    {
      code: `export const metadata = { twitter: { card: "large" } };`,
      errors: [{ messageId: "unknownCard", data: { value: "large" } }],
    },
    // generateMetadata variant
    {
      code: `export async function generateMetadata() { return { twitter: { card: "bad" } }; }`,
      errors: [{ messageId: "unknownCard", data: { value: "bad" } }],
    },
  ],
});
