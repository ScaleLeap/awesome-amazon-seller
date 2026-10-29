import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Firecrawl" entry.
 */
export const entry = {
  name: "Firecrawl",
  url: "https://www.firecrawl.dev",
  description: "Web scraping and search API for Amazon data. Scrape public Amazon pages as markdown (tested on Amazon.com, Amazon.co.uk and Amazon.de), or use structured data providers for Amazon.com (product details, prices, buy-box offers, reviews, search), Amazon.com.br and Amazon.nl.",
} satisfies EntryOptions;
