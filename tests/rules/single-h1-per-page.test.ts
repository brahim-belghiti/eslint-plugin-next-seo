import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { singleH1PerPage } from "../../src/rules/single-h1-per-page";

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run("single-h1-per-page", singleH1PerPage, {
  valid: [
    // Layout file with multiple H1s — rule doesn't run
    {
      code: `export default function L() { return <div><h1>A</h1><h1>B</h1></div>; }`,
      filename: "/app/layout.tsx",
    },

    // Random component file with multiple H1s — rule doesn't run
    {
      code: `export default function C() { return <div><h1>A</h1><h1>B</h1></div>; }`,
      filename: "/components/header.tsx",
    },

    // Page with exactly one H1
    {
      code: `export default function Page() { return <div><h1>Hello</h1><p>body</p></div>; }`,
      filename: "/app/about/page.tsx",
    },

    // Page with zero H1s — rule does NOT flag (likely composed via imported component)
    {
      code: `import Header from "./header"; export default function Page() { return <div><Header /><p>body</p></div>; }`,
      filename: "/app/about/page.tsx",
    },

    // Page with H1 in a conditional (still one H1 in source)
    {
      code: `export default function Page({ ok }: { ok: boolean }) { return <div>{ok && <h1>Hi</h1>}</div>; }`,
      filename: "/app/about/page.tsx",
    },

    // Page with capitalized custom component — silent (we don't know if it renders an h1)
    {
      code: `export default function Page() { return <div><H1>Hello</H1><H1>World</H1></div>; }`,
      filename: "/app/about/page.tsx",
    },

    // Page with one h1 plus other heading levels
    {
      code: `export default function Page() { return <article><h1>Title</h1><h2>Section</h2><h3>Sub</h3></article>; }`,
      filename: "/app/about/page.tsx",
    },

    // Page.ts (no JSX) — rule still runs but finds nothing to report
    {
      code: `export const dynamic = "force-dynamic";`,
      filename: "/app/about/page.ts",
    },

    // Early-return pattern — multiple returns each with one H1, mutually exclusive
    {
      code: `
        export default function Page({ loading, error }: any) {
          if (loading) return <h1>Loading</h1>;
          if (error) return <h1>Error</h1>;
          return <h1>Done</h1>;
        }
      `,
      filename: "/app/favorites/page.tsx",
    },

    // Early returns where some branches have no h1
    {
      code: `
        export default function Page({ loading }: any) {
          if (loading) return <div>Loading...</div>;
          return <main><h1>Title</h1></main>;
        }
      `,
      filename: "/app/about/page.tsx",
    },

    // Arrow function with expression body, single h1
    {
      code: `export default () => <main><h1>Hi</h1></main>;`,
      filename: "/app/about/page.tsx",
    },
  ],
  invalid: [
    // Two H1s in a page — one report on the second
    {
      code: `export default function Page() { return <div><h1>A</h1><h1>B</h1></div>; }`,
      filename: "/app/about/page.tsx",
      errors: [{ messageId: "multipleH1" }],
    },

    // Three H1s — two reports (on 2nd and 3rd)
    {
      code: `export default function Page() { return <div><h1>A</h1><h1>B</h1><h1>C</h1></div>; }`,
      filename: "/app/about/page.tsx",
      errors: [
        { messageId: "multipleH1" },
        { messageId: "multipleH1" },
      ],
    },

    // H1s in separate JSX subtrees still count
    {
      code: `export default function Page() { return <main><header><h1>Site</h1></header><section><h1>Page</h1></section></main>; }`,
      filename: "/app/about/page.tsx",
      errors: [{ messageId: "multipleH1" }],
    },

    // Different page-file extension still gated
    {
      code: `export default function Page() { return <div><h1>A</h1><h1>B</h1></div>; }`,
      filename: "/app/about/page.jsx",
      errors: [{ messageId: "multipleH1" }],
    },

    // Mixed: one return is fine, the other has duplicate H1s — only report the duplicate
    {
      code: `
        export default function Page({ loading }: any) {
          if (loading) return <h1>Loading</h1>;
          return <main><h1>A</h1><h1>B</h1></main>;
        }
      `,
      filename: "/app/about/page.tsx",
      errors: [{ messageId: "multipleH1" }],
    },

    // Arrow function expression body with two h1s
    {
      code: `export default () => <div><h1>A</h1><h1>B</h1></div>;`,
      filename: "/app/about/page.tsx",
      errors: [{ messageId: "multipleH1" }],
    },
  ],
});
