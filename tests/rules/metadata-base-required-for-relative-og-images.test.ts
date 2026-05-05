import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { metadataBaseRequiredForRelativeOgImages } from "../../src/rules/metadata-base-required-for-relative-og-images";

const tester = new RuleTester({
  languageOptions: { parser: tsParser },
});

tester.run("metadata-base-required-for-relative-og-images", metadataBaseRequiredForRelativeOgImages, {
  valid: [
    // No openGraph
    {
      code: `export const metadata = { title: "Home" };`,
    },
    // openGraph without images
    {
      code: `export const metadata = { openGraph: { title: "Home" } };`,
    },
    // Absolute URL — no metadataBase needed
    {
      code: `export const metadata = { openGraph: { images: ["https://example.com/og.png"] } };`,
    },
    // Protocol-relative URL — treated as absolute
    {
      code: `export const metadata = { openGraph: { images: ["//cdn.example.com/og.png"] } };`,
    },
    // Relative URL but metadataBase is set (literal)
    {
      code: `
        export const metadata = {
          metadataBase: new URL("https://example.com"),
          openGraph: { images: ["/og.png"] },
        };
      `,
    },
    // Relative URL but metadataBase is set (variable reference)
    {
      code: `
        export const metadata = {
          metadataBase: baseUrl,
          openGraph: { images: ["/og.png"] },
        };
      `,
    },
    // images is a variable — silent
    {
      code: `export const metadata = { openGraph: { images: ogImages } };`,
    },
    // openGraph is a variable — silent
    {
      code: `export const metadata = { openGraph: ogConfig };`,
    },
    // Absolute URL in object form
    {
      code: `export const metadata = { openGraph: { images: [{ url: "https://example.com/og.png", width: 1200 }] } };`,
    },
    // Relative URL in object form but metadataBase set
    {
      code: `
        export const metadata = {
          metadataBase: new URL("https://example.com"),
          openGraph: { images: [{ url: "/og.png" }] },
        };
      `,
    },
  ],
  invalid: [
    // Relative URL string, no metadataBase
    {
      code: `export const metadata = { openGraph: { images: ["/og.png"] } };`,
      errors: [{ messageId: "relativeOgImageWithoutMetadataBase", data: { url: "/og.png" } }],
    },
    // Relative URL in object form, no metadataBase
    {
      code: `export const metadata = { openGraph: { images: [{ url: "/og.png", width: 1200 }] } };`,
      errors: [{ messageId: "relativeOgImageWithoutMetadataBase", data: { url: "/og.png" } }],
    },
    // generateMetadata variant
    {
      code: `export async function generateMetadata() { return { openGraph: { images: ["/og.png"] } }; }`,
      errors: [{ messageId: "relativeOgImageWithoutMetadataBase", data: { url: "/og.png" } }],
    },
  ],
});
