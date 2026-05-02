import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { ogImageInMetadata } from "../../src/rules/og-image-in-metadata";

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
  },
});

tester.run("og-image-in-metadata", ogImageInMetadata, {
  valid: [
    `export const metadata = {};`,
    `export const metadata = { title: "x" };`,
    `export const metadata = { openGraph: { images: ["/og.png"] } };`,
    `export const metadata = { openGraph: { title: "x", images: [{ url: "/og.png" }] } };`,
    `export const metadata = { openGraph: { images: "/og.png" } };`,
    `export const openGraph = sharedOg; export const metadata = { openGraph };`,
    `export function generateMetadata() { return { openGraph: { images: ["/og.png"] } }; }`,
    `export const dynamic = "force-dynamic";`,
    `export function generateMetadata() { const m = load(); return m; }`,
  ],
  invalid: [
    {
      code: `export const metadata = { openGraph: {} };`,
      errors: [{ messageId: "missingOgImages" }],
    },
    {
      code: `export const metadata = { openGraph: { title: "x" } };`,
      errors: [{ messageId: "missingOgImages" }],
    },
    {
      code: `export const metadata = { openGraph: { title: "x", description: "y" } };`,
      errors: [{ messageId: "missingOgImages" }],
    },
    {
      code: `export function generateMetadata() { return { openGraph: { title: "x" } }; }`,
      errors: [{ messageId: "missingOgImages" }],
    },
    {
      code: `export const generateMetadata = () => ({ openGraph: { title: "x" } });`,
      errors: [{ messageId: "missingOgImages" }],
    },
  ],
});
