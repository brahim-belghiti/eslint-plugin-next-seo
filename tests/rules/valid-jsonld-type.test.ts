import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { validJsonldType } from "../../src/rules/valid-jsonld-type";

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

tester.run("valid-jsonld-type", validJsonldType, {
  valid: [
    // No JSON-LD scripts at all
    `export default function Page() { return <div />; }`,

    // Non-script element with the JSON-LD-looking type
    `const x = <div type="application/ld+json" />;`,

    // Script with a different type
    `const x = <script type="text/javascript" src="foo.js" />;`,

    // Properly formed JSON-LD via dangerouslySetInnerHTML
    `const x = <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: "Hi" })
      }}
    />;`,

    // Properly formed JSON-LD via Script child
    `const x = <Script type="application/ld+json">
      {JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: "Widget" })}
    </Script>;`,

    // Resolvable via const-bound variable
    `
      const schema = { "@context": "https://schema.org", "@type": "Organization", name: "Acme", url: "https://acme.com" };
      const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />;
    `,

    // Unresolvable literal — silent per V1 policy
    `
      import { schema } from "./schema";
      const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />;
    `,

    // Unknown @type but not close to any known — assume legit rare type
    `const x = <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@type": "MyCustomBusinessType" })
      }}
    />;`,

    // @type is dynamic (not a string literal) — silent
    `const x = <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@type": typeName })
      }}
    />;`,
  ],
  invalid: [
    // Missing @context
    {
      code: `const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@type": "Article", headline: "Hi" })
        }}
      />;`,
      errors: [{ messageId: "missingContext" }],
    },

    // Missing @type
    {
      code: `const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", headline: "Hi" })
        }}
      />;`,
      errors: [{ messageId: "missingType" }],
    },

    // Missing both
    {
      code: `const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ headline: "Hi" }) }}
      />;`,
      errors: [
        { messageId: "missingContext" },
        { messageId: "missingType" },
      ],
    },

    // Typo: Articel → Article
    {
      code: `const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Articel" })
        }}
      />;`,
      errors: [
        {
          messageId: "unknownType",
          data: { value: "Articel", suggestion: "Article" },
        },
      ],
    },

    // Typo: Produkt → Product
    {
      code: `const x = <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Produkt" })
        }}
      />;`,
      errors: [
        {
          messageId: "unknownType",
          data: { value: "Produkt", suggestion: "Product" },
        },
      ],
    },

    // Typo: Blogposting → BlogPosting (case typo)
    {
      code: `const x = <Script type="application/ld+json">
        {JSON.stringify({ "@context": "https://schema.org", "@type": "Blogposting" })}
      </Script>;`,
      errors: [
        {
          messageId: "unknownType",
          data: { value: "Blogposting", suggestion: "BlogPosting" },
        },
      ],
    },
  ],
});
