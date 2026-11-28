import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Apiwren Amazon Data API" entry.
 */
export const entry = {
  name: "Apiwren Amazon Data API",
  url: "https://rapidapi.com/apiwren-apiwren-default/api/amazon-data-api-search-product-reviews-best-sellers",
  description:
    "REST API that returns Amazon search results, product details, every seller's offer, reviews and best sellers for 23 marketplaces as JSON, without a PA-API or Associates account. Free plan of 20 requests a month on RapidAPI.",
} satisfies EntryOptions;
