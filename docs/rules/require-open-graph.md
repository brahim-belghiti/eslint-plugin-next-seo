# require-open-graph

Require that the Next.js `metadata` export includes an `openGraph` property.

## Why

`openGraph` controls how a URL renders when shared on Slack, Discord, iMessage, LinkedIn, X, Facebook, and most other platforms. Without it, the unfurled preview falls back to whatever the platform can scrape — usually a bare URL with no image or summary. Setting it deliberately is the difference between a card people click and a link people ignore.

## Examples

### ❌ Incorrect

```ts
export const metadata = {
  title: "Post",
  description: "A blog post",
};
```

### ✅ Correct

```ts
export const metadata = {
  title: "Post",
  description: "A blog post",
  openGraph: {
    title: "Post",
    description: "A blog post",
    images: ["/og.png"],
  },
};
```

```ts
export async function generateMetadata() {
  return {
    title: "Post",
    openGraph: { images: ["/og.png"] },
  };
}
```

## Related

Pair with [`og-image-in-metadata`](./og-image-in-metadata.md) to also require `openGraph.images`.

## Options

None.
