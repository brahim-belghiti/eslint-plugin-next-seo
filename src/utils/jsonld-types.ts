export const KNOWN_TYPES: ReadonlySet<string> = new Set([
  "Article",
  "BlogPosting",
  "NewsArticle",
  "Product",
  "Offer",
  "AggregateOffer",
  "Organization",
  "Person",
  "LocalBusiness",
  "Restaurant",
  "WebSite",
  "WebPage",
  "BreadcrumbList",
  "ItemList",
  "FAQPage",
  "Question",
  "Answer",
  "QAPage",
  "Recipe",
  "HowTo",
  "HowToStep",
  "Event",
  "Movie",
  "Book",
  "Course",
  "JobPosting",
  "Review",
  "AggregateRating",
  "ImageObject",
  "VideoObject",
  "AudioObject",
  "Service",
  "SoftwareApplication",
  "MobileApplication",
]);

export const REQUIRED_FIELDS: Readonly<Record<string, readonly string[]>> = {
  Article: ["headline", "image", "author", "datePublished"],
  BlogPosting: ["headline", "image", "author", "datePublished"],
  NewsArticle: ["headline", "image", "author", "datePublished"],
  Product: ["name", "image", "offers"],
  Organization: ["name", "url"],
  BreadcrumbList: ["itemListElement"],
  FAQPage: ["mainEntity"],
  Recipe: ["name", "image", "recipeIngredient", "recipeInstructions"],
  Event: ["name", "startDate", "location"],
};

function distance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1]! + 1,
        prev[j]! + 1,
        prev[j - 1]! + cost,
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n]!;
}

/**
 * If `value` is close to a known schema.org type, return the closest
 * match. Otherwise return null — assume the user is referring to a
 * real-but-uncommon schema.org type we don't track.
 *
 * Threshold is relative (floor(minLen/3), at least 1) so short strings
 * like "Foo" don't false-match "Book" at absolute distance 2.
 */
export function suggestKnownType(value: string): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const known of KNOWN_TYPES) {
    const d = distance(value, known);
    if (d < bestDist) {
      bestDist = d;
      best = known;
    }
  }
  if (best === null) return null;
  const minLen = Math.min(value.length, best.length);
  const threshold = Math.max(1, Math.floor(minLen / 3));
  return bestDist <= threshold ? best : null;
}
