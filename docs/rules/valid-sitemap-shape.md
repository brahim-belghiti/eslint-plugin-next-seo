# valid-sitemap-shape

Enforce well-formed entries in `app/sitemap.ts`.

## Why

Next.js silently renders a broken sitemap when entries are malformed. A missing `url` produces an entry that crawlers skip entirely. An out-of-range `priority` or an unrecognized `changeFrequency` string is ignored by Google — but it signals to you that something was mistyped.

This rule only runs on files named `sitemap.ts` or `sitemap.tsx`.

## Examples

### ❌ Incorrect

```ts
// app/sitemap.ts
export default function sitemap() {
  return [
    { title: "Home" },                               // missing url
    { url: "https://example.com", priority: 1.5 },   // priority out of range
    { url: "https://example.com/blog", changeFrequency: "yearli" }, // typo
  ];
}
```

### ✅ Correct

```ts
// app/sitemap.ts
export default function sitemap() {
  return [
    {
      url: "https://example.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
```

```ts
// Dynamic entries mixed with static — rule stays silent on the spread
export default async function sitemap() {
  const posts = await getPosts();
  return [
    { url: "https://example.com" },
    ...posts.map((p) => ({ url: `https://example.com/blog/${p.slug}` })),
  ];
}
```

## When the rule stays silent

- The file is not named `sitemap.ts` or `sitemap.tsx`.
- The default export is a variable reference (can't be statically analyzed).
- No default export at all.
- Array entries that are spread elements or non-object expressions.
- `priority` or `changeFrequency` set to a variable or expression.

Valid `changeFrequency` values: `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, `never`.

## Options

None.
