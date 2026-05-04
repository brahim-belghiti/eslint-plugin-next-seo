# valid-openGraph-type

Enforce valid `openGraph.type` values.

## Why

The Open Graph protocol defines a fixed set of types. An unrecognized type is ignored by social platforms, which fall back to default rendering — typically worse than the structured card you intended.

## Examples

### ❌ Incorrect

```ts
export const metadata = {
  openGraph: { type: "webpage" }, // not a valid OG type
};
```

```ts
export const metadata = {
  openGraph: { type: "articles" }, // typo — should be "article"
};
```

### ✅ Correct

```ts
export const metadata = {
  openGraph: { type: "article" },
};
```

```ts
export const metadata = {
  openGraph: { type: "website" },
};
```

Valid values: `website`, `article`, `book`, `profile`, `music.song`, `music.album`, `music.playlist`, `music.radio_station`, `video.movie`, `video.episode`, `video.tv_show`, `video.other`.

## When the rule stays silent

- `openGraph` is missing — see [`require-open-graph`](./require-open-graph.md).
- `openGraph.type` is missing — platforms default to `website`.
- `openGraph` or `type` is a variable or expression — the rule cannot statically verify the value.

## Options

None.
