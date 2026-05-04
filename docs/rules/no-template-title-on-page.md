# no-template-title-on-page

Disallow `title.template` in page files; templates only belong in layout files.

## Why

`title: { template: "%s | Site" }` is Next.js's mechanism for layouts to wrap the titles of their child pages. Putting it on a page is a no-op at best and a misunderstanding at worst — pages are leaves, so there is no child title for `%s` to substitute. The fix is almost always one of two things:

- Move `template` up to `layout.tsx` and let pages provide a plain string `title`.
- Replace the page's `title` with a plain string.

The rule only runs on files matching `page.{tsx,ts,jsx,js}`.

## Examples

### ❌ Incorrect (in `app/about/page.tsx`)

```ts
export const metadata = {
  title: { template: "%s | Site", default: "About" },
};
```

```ts
export const metadata = {
  title: { template: "%s — Acme" },
};
```

### ✅ Correct (in `app/about/page.tsx`)

```ts
export const metadata = {
  title: "About",
};
```

```ts
export const metadata = {
  title: { absolute: "About — Acme" },
};
```

### ✅ Correct (in `app/layout.tsx`)

```ts
export const metadata = {
  title: { template: "%s | Site", default: "Site" },
};
```

This rule does not run on layout files, so the template stays.

## Options

None.
