# single-h1-per-page

Disallow more than one `<h1>` element in a Next.js App Router page file.

## Why

The `<h1>` is the document's main heading — search engines use it to understand what the page is *about*, and screen readers use it to anchor navigation. Two `<h1>` tags split that signal: crawlers don't know which one is the real subject, and users of assistive tech land on whichever the page renders first.

This is one of the most common SEO regressions in component-heavy codebases. A site header includes `<h1>SiteName</h1>` for branding, the page also renders `<h1>Article Title</h1>`, and now every page has two H1s.

The rule only runs on files matching `page.{tsx,ts,jsx,js}` — layouts and shared components are free to use H1 however they want, since whether a stray H1 in a layout is a problem depends on which page composes it.

## What it catches (and what it doesn't)

It flags **literal `<h1>` JSX elements** declared directly in a page file. It does **not** follow imports — if your page renders `<PageHeader />` and that component contains an `<h1>`, the rule can't see it. That's why the rule only enforces the upper bound (no more than one), not the lower bound (at least one): a page with zero literal `<h1>`s is almost always composing the heading via an imported component.

It also stays silent on capitalized custom components (`<H1>`, `<Heading level={1}>`) — those aren't HTML `<h1>` tags, and we can't statically know what they render.

## Examples

### ❌ Incorrect (in `app/about/page.tsx`)

```jsx
export default function Page() {
  return (
    <main>
      <h1>About Acme</h1>
      <section>
        <h1>Our Mission</h1>
      </section>
    </main>
  );
}
```

### ✅ Correct

```jsx
export default function Page() {
  return (
    <main>
      <h1>About Acme</h1>
      <section>
        <h2>Our Mission</h2>
      </section>
    </main>
  );
}
```

```jsx
// Page with zero literal h1 — composed from a component, rule stays silent
import PageHeader from "@/components/page-header";

export default function Page() {
  return (
    <main>
      <PageHeader title="About Acme" />
      <section>
        <h2>Our Mission</h2>
      </section>
    </main>
  );
}
```

## Options

None.
