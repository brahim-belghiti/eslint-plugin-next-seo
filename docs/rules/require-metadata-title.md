# require-metadata-title

Require that the Next.js `metadata` export includes a `title` property.

## Why

`title` is the single most important SEO field. It's what shows up as the link in search results and in the browser tab. A missing title leaves Next.js to fall back on the route name or empty content, which is almost never what you want.

## Examples

### ❌ Incorrect

```ts
export const metadata = {
  description: "About our company",
};
```

```ts
export function generateMetadata() {
  return { description: "About" };
}
```

### ✅ Correct

```ts
export const metadata = {
  title: "About",
  description: "About our company",
};
```

```ts
export async function generateMetadata() {
  return { title: "About", description: "About" };
}
```

## When the rule stays silent

If `generateMetadata` does not directly `return { ... }` an object literal (e.g. it returns a variable, awaits a fetch and spreads it, or branches on conditions), the rule cannot statically verify the shape and skips the file. V1 favors no false positives over completeness.

## Options

None.
