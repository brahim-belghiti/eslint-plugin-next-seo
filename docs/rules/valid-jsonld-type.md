# valid-jsonld-type

Require `@context` and `@type` on JSON-LD scripts and flag typos in `@type`.

## Why

JSON-LD is the structured-data format Google and other crawlers use for rich results — product cards, recipe ratings, FAQ accordions, breadcrumbs, etc. A JSON-LD blob is meaningless to crawlers without `@context` (the schema vocabulary, almost always `"https://schema.org"`) and `@type` (which schema is being declared). And a typo in `@type` — `"Articel"`, `"Produkt"` — silently invalidates the whole block: no rich result, no error in build, no warning in production. This rule catches both.

The rule only fires on JSON-LD scripts with a statically analyzable literal — either an inline `JSON.stringify({...})` or a same-file `const` resolving to one. If the data is fetched, imported, or built dynamically, the rule stays silent (V1 no-false-positives policy).

Typo detection uses Levenshtein distance against ~30 of the most common schema.org types. If the value is *close* to a known type, it's flagged with a suggestion. If it's far from anything we know, the rule assumes you're using a real-but-uncommon type and stays silent.

## Examples

### ❌ Incorrect

```jsx
// Missing @context
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({ "@type": "Article", headline: "Hi" }),
  }}
/>
```

```jsx
// Missing @type
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({ "@context": "https://schema.org", headline: "Hi" }),
  }}
/>
```

```jsx
// Typo: "Articel" → suggests "Article"
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Articel",
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
    }),
  }}
/>
```

```jsx
import Script from "next/script";

<Script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Widget",
  })}
</Script>
```

```jsx
// Resolved via same-file const
const schema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Acme",
};

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
/>
```

## When the rule stays silent

- The script's JSON-LD object is not statically resolvable (imported, fetched, or built at runtime).
- `@type` is set to a value that's not close to any known type — the rule assumes you're referencing a real-but-uncommon schema.org type.
- The element isn't a JSON-LD `<script>` (i.e. `type` attribute is missing, dynamic, or set to anything other than `"application/ld+json"`).

## Related

Pair with [`valid-jsonld-fields`](./valid-jsonld-fields.md) to also check that each `@type` includes the fields Google requires for rich-results eligibility.

## Options

None.
