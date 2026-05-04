# metadata-keywords-shape

Enforce `keywords` is an array of strings, not a comma-separated string.

## Why

Next.js expects `keywords` to be `string[]`. Passing a single comma-separated string is a common mistake rooted in the old `<meta name="keywords">` HTML pattern. The string form silently produces a malformed keywords tag.

## Examples

### ❌ Incorrect

```ts
export const metadata = {
  keywords: "seo, nextjs, app-router",
};
```

### ✅ Correct

```ts
export const metadata = {
  keywords: ["seo", "nextjs", "app-router"],
};
```

## When the rule stays silent

- `keywords` is a variable, expression, or function call — the rule only flags string literals.
- `keywords` is an array literal — that's the correct shape.
- No `keywords` at all.

## Options

None.
