import { describe, expect, it } from "vitest";
import {
  KNOWN_TYPES,
  REQUIRED_FIELDS,
  suggestKnownType,
} from "../../src/utils/jsonld-types";

describe("KNOWN_TYPES", () => {
  it("includes the most common types", () => {
    expect(KNOWN_TYPES.has("Article")).toBe(true);
    expect(KNOWN_TYPES.has("BlogPosting")).toBe(true);
    expect(KNOWN_TYPES.has("Product")).toBe(true);
    expect(KNOWN_TYPES.has("Organization")).toBe(true);
    expect(KNOWN_TYPES.has("FAQPage")).toBe(true);
    expect(KNOWN_TYPES.has("Recipe")).toBe(true);
  });
});

describe("REQUIRED_FIELDS", () => {
  it("covers Google rich-results-eligible types", () => {
    expect(REQUIRED_FIELDS.Article).toContain("headline");
    expect(REQUIRED_FIELDS.Product).toContain("name");
    expect(REQUIRED_FIELDS.Recipe).toContain("recipeIngredient");
    expect(REQUIRED_FIELDS.Event).toContain("startDate");
  });

  it("only references known types", () => {
    for (const type of Object.keys(REQUIRED_FIELDS)) {
      expect(KNOWN_TYPES.has(type)).toBe(true);
    }
  });
});

describe("suggestKnownType", () => {
  it("returns null for an exact match (caller should check KNOWN_TYPES first)", () => {
    expect(suggestKnownType("Article")).toBe("Article");
  });

  it("suggests Article for 'Articel'", () => {
    expect(suggestKnownType("Articel")).toBe("Article");
  });

  it("suggests Product for 'Produkt'", () => {
    expect(suggestKnownType("Produkt")).toBe("Product");
  });

  it("suggests BlogPosting for 'Blogposting' (case typo)", () => {
    expect(suggestKnownType("Blogposting")).toBe("BlogPosting");
  });

  it("returns null for completely unrelated strings", () => {
    expect(suggestKnownType("CompletelyUnknownType")).toBeNull();
    expect(suggestKnownType("Foo")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(suggestKnownType("")).toBeNull();
  });
});
