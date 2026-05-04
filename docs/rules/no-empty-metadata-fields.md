# no-empty-metadata-fields

Disallow empty string values in `metadata` fields like `title` and `description`.

## Why

An empty `title` or `description` is worse than a missing one — Next.js will render the empty string as-is into the document head, producing `<title></title>` or a blank meta description. That actively suppresses search-engine fallbacks (like the `<h1>`) and ships a broken result. This usually happens when a placeholder gets committed or a template variable resolves to `""`.

The rule flags both empty strings (`""`) and whitespace-only strings (`"   "`), in normal and template-literal form.

## Examples

### ❌ Incorrect

```ts
export const metadata = {
  title: "",
  description: "About us",
};
```

```ts
export const metadata = {
  title: "About",
  description: `   `,
};
```

### ✅ Correct

```ts
export const metadata = {
  title: "About",
  description: "About our company",
};
```

```ts
export const metadata = {
  title: `Welcome ${user}`,
  description: "Hello",
};
```

## Scope

Currently checks `title` and `description` only. Other fields (`keywords`, `applicationName`, etc.) are not checked in V1.

## Options

None.
