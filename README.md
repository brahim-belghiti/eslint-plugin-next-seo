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

That enables all rules — metadata rules at `error`, plus the JSON-LD rules (`valid-jsonld-type` at `error`, `valid-jsonld-fields` at `warn`).

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

| Rule | What it catches |
|------|-----------------|
| [require-metadata-title](docs/rules/require-metadata-title.md) | Metadata export missing `title` |
| [require-metadata-description](docs/rules/require-metadata-description.md) | Metadata export missing `description` |
| [require-open-graph](docs/rules/require-open-graph.md) | Metadata export missing `openGraph` |
| [no-empty-metadata-fields](docs/rules/no-empty-metadata-fields.md) | `title` or `description` set to an empty string |
| [no-template-title-on-page](docs/rules/no-template-title-on-page.md) | `title.template` used in a page file (only valid in `layout`) |
| [og-image-in-metadata](docs/rules/og-image-in-metadata.md) | `openGraph` set without `images` |

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

## License

[MIT](./LICENSE)
