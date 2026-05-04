# metadata-title-length

Warn when metadata `title` exceeds 60 characters.

## Why

Search engines typically truncate page titles beyond 55–60 characters in results pages. A title that's too long gets cut off mid-word, hurting click-through rates and readability.

## Examples

### ❌ Incorrect

```ts
export const metadata = {
  title: "This Is A Very Long Page Title That Will Definitely Get Truncated By Search",
};
```

```ts
export const metadata = {
  title: {
    default: "This Is A Very Long Page Title That Will Definitely Get Truncated By Search",
  },
};
```

### ✅ Correct

```ts
export const metadata = {
  title: "About Us",
};
```

```ts
export const metadata = {
  title: {
    default: "About Us",
    template: "%s | Acme",
  },
};
```

## When the rule stays silent

- `title` is a variable, expression, or function call — the rule cannot statically resolve the length.
- `title: { template: "..." }` — the template contains a placeholder; the rendered value determines the length, not the template string itself.
- No `title` at all — that's [`require-metadata-title`](./require-metadata-title.md)'s job.

## Options

None.
