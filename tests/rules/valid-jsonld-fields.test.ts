import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { validJsonldFields } from "../../src/rules/valid-jsonld-fields";

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run("valid-jsonld-fields", validJsonldFields, {
  valid: [
    // No JSON-LD at all
    `export default function Page() { return <div />; }`,

    // Type with no required-fields entry — silent
    `const x = <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Acme" })
      }}
    />;`,

    // Article with all required fields
    `const x = <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Hello",
          image: "/og.png",
          author: { "@type": "Person", name: "Brahim" },
          datePublished: "2026-01-01"
        })
      }}
    />;`,

    // Product with required fields
    `const x = <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Widget",
          image: "/widget.png",
          offers: { "@type": "Offer", price: 9.99, priceCurrency: "USD" }
        })
      }}
    />;`,

    // Unknown type — silent (defer to valid-jsonld-type for typo detection)
    `const x = <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Articel", headline: "Hi" })
      }}
    />;`,

    // No @type — silent (defer to valid-jsonld-type)
    `const x = <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org" }) }}
    />;`,

    // Unresolvable literal
    `
      import { schema } from "./schema";
      const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />;
    `,
  ],
  invalid: [
    // Article missing headline
    {
      code: `const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            image: "/og.png",
            author: "Brahim",
            datePublished: "2026-01-01"
          })
        }}
      />;`,
      errors: [
        {
          messageId: "missingRequiredField",
          data: { type: "Article", field: "headline" },
        },
      ],
    },

    // Article missing multiple fields
    {
      code: `const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Hi"
          })
        }}
      />;`,
      errors: [
        { messageId: "missingRequiredField", data: { type: "Article", field: "image" } },
        { messageId: "missingRequiredField", data: { type: "Article", field: "author" } },
        { messageId: "missingRequiredField", data: { type: "Article", field: "datePublished" } },
      ],
    },

    // Product missing offers
    {
      code: `const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Widget",
            image: "/widget.png"
          })
        }}
      />;`,
      errors: [
        {
          messageId: "missingRequiredField",
          data: { type: "Product", field: "offers" },
        },
      ],
    },

    // BreadcrumbList missing itemListElement
    {
      code: `const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList" })
        }}
      />;`,
      errors: [
        {
          messageId: "missingRequiredField",
          data: { type: "BreadcrumbList", field: "itemListElement" },
        },
      ],
    },

    // Recipe missing recipeIngredient
    {
      code: `const x = <Script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Recipe",
          name: "Pasta",
          image: "/pasta.png",
          recipeInstructions: ["boil water"]
        })}
      </Script>;`,
      errors: [
        {
          messageId: "missingRequiredField",
          data: { type: "Recipe", field: "recipeIngredient" },
        },
      ],
    },
  ],
});
