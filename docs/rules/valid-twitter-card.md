# valid-twitter-card

Enforce valid `twitter.card` values.

## Why

Twitter (X) only recognizes four card types. Any other string silently falls back to no card at all, losing the rich preview entirely.

## Examples

### ❌ Incorrect

```ts
export const metadata = {
  twitter: { card: "summary_large_image_card" }, // typo
};
```

```ts
export const metadata = {
  twitter: { card: "large" }, // not a valid type
};
```

### ✅ Correct

```ts
export const metadata = {
  twitter: { card: "summary_large_image" },
};
```

```ts
export const metadata = {
  twitter: { card: "summary" },
};
```

Valid values: `summary`, `summary_large_image`, `app`, `player`.

## When the rule stays silent

- `twitter` is missing entirely — the Twitter spec defaults to `summary`.
- `twitter.card` is missing — same default applies.
- `twitter` or `card` is a variable or expression — the rule cannot statically verify the value.

## Options

None.
