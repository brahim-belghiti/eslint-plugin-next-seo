# metadata-description-length

Warn when metadata `description` exceeds 160 characters.

## Why

Search engines typically truncate meta descriptions beyond 155–160 characters in results pages. Descriptions that are too long get cut off, which can break the sentence mid-thought and reduce click-through rates.

## Examples

### ❌ Incorrect

```ts
export const metadata = {
  description:
    "This description is far too long and will certainly be truncated by search engines when it appears in the results page beneath the title link.",
};
```

### ✅ Correct

```ts
export const metadata = {
  description: "A short, compelling description under 160 characters.",
};
```

## When the rule stays silent

- `description` is a variable, expression, or function call — the rule cannot statically resolve the length.
- No `description` at all — that's [`require-metadata-description`](./require-metadata-description.md)'s job.

## Options

None.
