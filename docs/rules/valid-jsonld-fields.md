# valid-jsonld-fields

Require fields needed for Google rich-results eligibility per JSON-LD `@type`.

## Why

A `@type: "Product"` JSON-LD blob without an `offers` field, or an `Article` without `datePublished`, is technically valid schema.org but ineligible for the rich-result it was probably intended to produce. Google's rich-results guidelines specify required properties per type, and missing them is the most common reason a structured-data block compiles fine but never shows up in search.

This rule only fires when the `@type` is one we have a curated requirement list for. Other types pass silently — we'd rather miss an unusual case than nag on types we haven't vetted. And like every rule in this plugin, the JSON-LD literal must be statically resolvable; dynamic blobs are skipped.

Default severity is `warn`, not `error`, because rich-result eligibility is a *recommendation* (you can ship valid JSON-LD without these fields), not a correctness requirement.

## Covered types and required fields

| `@type` | Required fields |
|--------|----------------|
| `Article` / `BlogPosting` / `NewsArticle` | `headline`, `image`, `author`, `datePublished` |
| `Product` | `name`, `image`, `offers` |
| `Organization` | `name`, `url` |
| `BreadcrumbList` | `itemListElement` |
| `FAQPage` | `mainEntity` |
| `Recipe` | `name`, `image`, `recipeIngredient`, `recipeInstructions` |
| `Event` | `name`, `startDate`, `location` |

Other `@type` values are not checked by this rule.

## Examples

### ❌ Incorrect

```jsx
// Article missing headline
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      image: "/og.png",
      author: "Brahim",
      datePublished: "2026-01-01",
    }),
  }}
/>
```

```jsx
// Product without offers
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Widget",
      image: "/widget.png",
    }),
  }}
/>
```

### ✅ Correct

```jsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Hello",
      image: "/og.png",
      author: { "@type": "Person", name: "Brahim" },
      datePublished: "2026-01-01",
    }),
  }}
/>
```

## Related

Pair with [`valid-jsonld-type`](./valid-jsonld-type.md), which catches missing `@context`/`@type` and typos like `"Articel"`.

## Options

None.
