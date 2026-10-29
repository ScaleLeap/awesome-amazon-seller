import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "ScrapeUnblocker" entry.
 */
export const entry = {
  name: "ScrapeUnblocker",
  url: "https://docs.scrapeunblocker.com/plugins/amazon",
  description: "Web scraping API with Amazon endpoints that return JSON: product pages (price, list price, availability, rating, seller, images), search results with sponsored and Prime flags, Best Sellers and other ranked lists, and review data with the star histogram, across Amazon's regional marketplaces. Also available as an MCP server.",
} satisfies EntryOptions;
