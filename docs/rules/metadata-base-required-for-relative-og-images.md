# metadata-base-required-for-relative-og-images

Require `metadataBase` when `openGraph.images` contains relative URLs.

## Why

Next.js uses `metadataBase` to resolve relative URLs in metadata fields into absolute URLs for social sharing previews. If `openGraph.images` contains a relative path like `/og.png` without `metadataBase`, Next.js cannot produce a valid absolute URL — the image will be missing or broken in link previews.

## Examples

### ❌ Incorrect

```ts
export const metadata = {
  openGraph: {
    images: ["/og.png"],  // relative URL, no metadataBase
  },
};
```

```ts
export const metadata = {
  openGraph: {
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};
```

### ✅ Correct

```ts
export const metadata = {
  metadataBase: new URL("https://example.com"),
  openGraph: {
    images: ["/og.png"],  // resolved to https://example.com/og.png
  },
};
```

```ts
// Absolute URLs don't need metadataBase
export const metadata = {
  openGraph: {
    images: ["https://example.com/og.png"],
  },
};
```

## When the rule stays silent

- `openGraph` is missing or is not an object literal.
- `openGraph.images` is a variable or expression (not an array literal).
- All image URLs are absolute (contain `://`) or protocol-relative (start with `//`).
- `metadataBase` is set to any value, including a variable reference.

## Options

None.
