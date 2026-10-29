import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Amazon Scraper API" entry.
 */
export const entry = {
  name: "Amazon Scraper API",
  url: "https://amazonscraperapi.com",
  description: "Production REST API for Amazon product, search, and batch ASIN data across 20 marketplaces. Residential proxies and TLS impersonation handled server-side. 1000 free requests on signup.",
} satisfies EntryOptions;
