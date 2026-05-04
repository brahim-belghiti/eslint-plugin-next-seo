# require-metadata-description

Require that the Next.js `metadata` export includes a `description` property.

## Why

`description` is the snippet shown under the title in search results. Without it, search engines will pick arbitrary text from the page — often boilerplate or navigation. Setting it explicitly is a low-effort win for click-through rate.

## Examples

### ❌ Incorrect

```ts
export const metadata = {
  title: "Pricing",
};
```

```ts
export function generateMetadata() {
  return { title: "Pricing" };
}
```

### ✅ Correct

```ts
export const metadata = {
  title: "Pricing",
  description: "Plans and pricing for teams of every size.",
};
```

```ts
export async function generateMetadata() {
  return {
    title: "Pricing",
    description: "Plans and pricing for teams of every size.",
  };
}
```

## When the rule stays silent

If `generateMetadata` does not directly `return { ... }` an object literal, the rule cannot statically verify the shape and skips the file.

## Options

None.
