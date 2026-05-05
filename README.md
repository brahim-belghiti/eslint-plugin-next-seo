# eslint-plugin-next-seo

Catches SEO mistakes in Next.js App Router metadata at build time.

Complements [`@next/eslint-plugin-next`](https://www.npmjs.com/package/@next/eslint-plugin-next): that one handles framework correctness, this one handles SEO correctness in your `metadata` exports and `generateMetadata` functions.

## Install

```sh
npm install --save-dev eslint-plugin-next-seo
```

Requires ESLint 9+ and Node 18.18+.

## Usage

```js
// eslint.config.js
import nextSeo from "eslint-plugin-next-seo";

export default [
  nextSeo.configs.recommended,
];
```

That enables all rules — metadata rules at `error` (length rules at `warn`), JSON-LD rules (`valid-jsonld-type` at `error`, `valid-jsonld-fields` at `warn`), and JSX content rules.

### Manual rule selection

```js
import nextSeo from "eslint-plugin-next-seo";

export default [
  {
    plugins: { "next-seo": nextSeo },
    rules: {
      "next-seo/require-metadata-title": "error",
      "next-seo/og-image-in-metadata": "warn",
    },
  },
];
```

## Rules

All rules ship in `configs.recommended`.

**Metadata rules** (analyze the `metadata` export / `generateMetadata` function):

| Rule | Severity | What it catches |
|------|----------|-----------------|
| [require-metadata-title](docs/rules/require-metadata-title.md) | error | Metadata export missing `title` |
| [require-metadata-description](docs/rules/require-metadata-description.md) | error | Metadata export missing `description` |
| [require-open-graph](docs/rules/require-open-graph.md) | error | Metadata export missing `openGraph` |
| [no-empty-metadata-fields](docs/rules/no-empty-metadata-fields.md) | error | `title` or `description` set to an empty string |
| [no-template-title-on-page](docs/rules/no-template-title-on-page.md) | error | `title.template` used in a page file (only valid in `layout`) |
| [og-image-in-metadata](docs/rules/og-image-in-metadata.md) | error | `openGraph` set without `images` |
| [metadata-title-length](docs/rules/metadata-title-length.md) | warn | Static `title` over 60 characters (truncated in SERPs) |
| [metadata-description-length](docs/rules/metadata-description-length.md) | warn | Static `description` over 160 characters (truncated in SERPs) |
| [valid-twitter-card](docs/rules/valid-twitter-card.md) | error | `twitter.card` not in the valid set |
| [valid-openGraph-type](docs/rules/valid-openGraph-type.md) | error | `openGraph.type` not a valid Open Graph type |
| [metadata-keywords-shape](docs/rules/metadata-keywords-shape.md) | error | `keywords` passed as a string instead of an array |
| [metadata-base-required-for-relative-og-images](docs/rules/metadata-base-required-for-relative-og-images.md) | error | `openGraph.images` has relative URLs but no `metadataBase` set |
| [no-metadata-in-client-component](docs/rules/no-metadata-in-client-component.md) | error | `metadata` or `generateMetadata` export in a `"use client"` file — silently ignored by Next.js |

**Sitemap rules** (analyze `app/sitemap.ts`):

| Rule | Severity | What it catches |
|------|----------|-----------------|
| [valid-sitemap-shape](docs/rules/valid-sitemap-shape.md) | error | Missing `url`, out-of-range `priority`, or invalid `changeFrequency` in sitemap entries |

**JSON-LD rules** (analyze `<script type="application/ld+json">` blocks):

| Rule | What it catches |
|------|-----------------|
| [valid-jsonld-type](docs/rules/valid-jsonld-type.md) | Missing `@context`/`@type`, plus typo detection (`"Articel"` → `"Article"`) |
| [valid-jsonld-fields](docs/rules/valid-jsonld-fields.md) | Missing fields needed for Google rich-results per `@type` (warn-level by default) |

**JSX content rules** (analyze the rendered output of page files):

| Rule | What it catches |
|------|-----------------|
| [single-h1-per-page](docs/rules/single-h1-per-page.md) | More than one literal `<h1>` in a `page.tsx` |

## How it analyzes

Both metadata shapes are supported:

```ts
// Static metadata
export const metadata = {
  title: "Hello",
  description: "World",
};

// Dynamic metadata
export function generateMetadata() {
  return { title: "Hello" };
}
```

For `generateMetadata`, only a direct `return { ... }` of an object literal is analyzed. When the function is more complex (conditionals, fetched data, returning a variable), the rules stay silent — V1 favors no false positives over completeness.

## Companion CLI

The package also ships a `next-seo` CLI for cross-file checks that ESLint cannot perform on a single file in isolation.

```sh
npx next-seo check
```

The CLI auto-detects `app/` (or `src/app/`) under the current working directory. Use `--dir <path>` for non-standard layouts.

| Check | Severity | What it does |
|-------|----------|--------------|
| `require-sitemap` | error | Verifies `app/sitemap.{ts,tsx,xml}` exists |
| `require-robots` | error | Verifies `app/robots.{ts,txt}` exists |
| `metadata-coverage` | info | Reports the ratio of `page.tsx` files that export `metadata` directly |

Exit code is `1` when any error is reported, `0` otherwise. Run it in CI alongside your ESLint step.

## License

[MIT](./LICENSE)
