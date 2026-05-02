import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { noTemplateTitleOnPage } from "../../src/rules/no-template-title-on-page";

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
  },
});

tester.run("no-template-title-on-page", noTemplateTitleOnPage, {
  valid: [
    {
      code: `export const metadata = { title: { template: "%s | App", default: "App" } };`,
      filename: "/app/layout.tsx",
    },
    {
      code: `export const metadata = { title: { template: "%s | App", default: "App" } };`,
      filename: "/app/dashboard/layout.tsx",
    },
    {
      code: `export const metadata = { title: "Home" };`,
      filename: "/app/page.tsx",
    },
    {
      code: `export const metadata = {};`,
      filename: "/app/page.tsx",
    },
    {
      code: `export const metadata = { description: "x" };`,
      filename: "/app/page.tsx",
    },
    {
      code: `export const metadata = { title: { template: "%s | App" } };`,
      filename: "/lib/util.ts",
    },
    {
      code: `export function generateMetadata() { return { title: "Home" }; }`,
      filename: "/app/page.tsx",
    },
  ],
  invalid: [
    {
      code: `export const metadata = { title: { template: "%s | App", default: "App" } };`,
      filename: "/app/page.tsx",
      errors: [{ messageId: "templateOnPage" }],
    },
    {
      code: `export const metadata = { title: { template: "%s | App" } };`,
      filename: "/app/dashboard/page.tsx",
      errors: [{ messageId: "templateOnPage" }],
    },
    {
      code: `export const metadata = { title: { template: "%s | App" } };`,
      filename: "/app/page.ts",
      errors: [{ messageId: "templateOnPage" }],
    },
    {
      code: `export function generateMetadata() { return { title: { template: "%s | App" } }; }`,
      filename: "/app/page.tsx",
      errors: [{ messageId: "templateOnPage" }],
    },
    {
      code: `export const generateMetadata = () => ({ title: { template: "%s | App" } });`,
      filename: "/app/page.tsx",
      errors: [{ messageId: "templateOnPage" }],
    },
  ],
});
