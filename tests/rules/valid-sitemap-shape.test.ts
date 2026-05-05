import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { validSitemapShape } from "../../src/rules/valid-sitemap-shape";

const tester = new RuleTester({
  languageOptions: { parser: tsParser },
});

tester.run("valid-sitemap-shape", validSitemapShape, {
  valid: [
    // Non-sitemap file — silent regardless of contents
    {
      code: `export default function notASitemap() { return [{ url: 123 }]; }`,
      filename: "/app/page.tsx",
    },

    // Valid sync function declaration
    {
      code: `
        export default function sitemap() {
          return [{ url: "https://example.com" }];
        }
      `,
      filename: "/app/sitemap.ts",
    },

    // Valid async function declaration
    {
      code: `
        export default async function sitemap() {
          return [{ url: "https://example.com" }];
        }
      `,
      filename: "/app/sitemap.ts",
    },

    // Valid arrow function with expression body
    {
      code: `export default () => [{ url: "https://example.com" }];`,
      filename: "/app/sitemap.ts",
    },

    // All optional fields valid
    {
      code: `
        export default function sitemap() {
          return [{
            url: "https://example.com",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
          }];
        }
      `,
      filename: "/app/sitemap.ts",
    },

    // Mixed static + dynamic (spread) entries — silent on spread
    {
      code: `
        export default async function sitemap() {
          const posts = await getPosts();
          return [
            { url: "https://example.com" },
            ...posts.map(p => ({ url: p.url })),
          ];
        }
      `,
      filename: "/app/sitemap.ts",
    },

    // Default export of variable — silent
    {
      code: `
        const sitemap = () => [{ url: "https://example.com" }];
        export default sitemap;
      `,
      filename: "/app/sitemap.ts",
    },

    // No default export — silent
    {
      code: `export const config = {};`,
      filename: "/app/sitemap.ts",
    },

    // priority at boundary values
    {
      code: `
        export default function sitemap() {
          return [
            { url: "https://example.com", priority: 0 },
            { url: "https://example.com/about", priority: 1 },
          ];
        }
      `,
      filename: "/app/sitemap.ts",
    },
  ],
  invalid: [
    // Entry missing url
    {
      code: `
        export default function sitemap() {
          return [{ title: "Home" }];
        }
      `,
      filename: "/app/sitemap.ts",
      errors: [{ messageId: "entryMissingUrl" }],
    },

    // priority > 1
    {
      code: `
        export default function sitemap() {
          return [{ url: "https://example.com", priority: 1.5 }];
        }
      `,
      filename: "/app/sitemap.ts",
      errors: [{ messageId: "invalidPriority", data: { value: 1.5 } }],
    },

    // priority < 0
    {
      code: `
        export default function sitemap() {
          return [{ url: "https://example.com", priority: -0.1 }];
        }
      `,
      filename: "/app/sitemap.ts",
      errors: [{ messageId: "invalidPriority", data: { value: -0.1 } }],
    },

    // invalid changeFrequency (typo)
    {
      code: `
        export default function sitemap() {
          return [{ url: "https://example.com", changeFrequency: "yearli" }];
        }
      `,
      filename: "/app/sitemap.ts",
      errors: [{ messageId: "invalidChangeFrequency", data: { value: "yearli" } }],
    },

    // Arrow function with bad entry
    {
      code: `export default () => [{ changeFrequency: "bad" }];`,
      filename: "/app/sitemap.tsx",
      errors: [
        { messageId: "entryMissingUrl" },
        { messageId: "invalidChangeFrequency", data: { value: "bad" } },
      ],
    },
  ],
});
