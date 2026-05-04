# og-image-in-metadata

Require `openGraph.images` when `openGraph` is set.

## Why

Once you opt into Open Graph metadata, the image is what makes the shared link visually distinct. An `openGraph` object without `images` produces a text-only unfurl on every platform — same width as a card with an image, but blank space where the preview should be. If you've set `openGraph` at all, you almost certainly meant to set an image too.

## Examples

### ❌ Incorrect

```ts
export const metadata = {
  openGraph: { title: "Post" },
};
```

```ts
export const metadata = {
  openGraph: {},
};
```

```ts
export function generateMetadata() {
  return { openGraph: { title: "Post" } };
}
```

### ✅ Correct

```ts
export const metadata = {
  openGraph: {
    title: "Post",
    images: ["/og.png"],
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

```ts
// No openGraph at all — this rule does not fire.
// (See `require-open-graph` if you want to require it.)
export const metadata = {
  title: "Post",
};
```

## When the rule stays silent

If `openGraph` is set to something other than an object literal — a variable reference, a spread, the result of a function call — the rule cannot statically verify the shape and skips it. V1 favors no false positives.

## Related

Pair with [`require-open-graph`](./require-open-graph.md) if you want to require that `openGraph` exists in the first place.

## Options

None.
