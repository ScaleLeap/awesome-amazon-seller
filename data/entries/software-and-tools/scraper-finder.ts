import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Scraper Finder" entry.
 */
export const entry = {
  name: "Scraper Finder",
  url: "https://scraperfinder.com/sites/amazon/",
  description: "Compares 20 ready-made Amazon data tools, mostly pay-per-result Apify Actors, and Amazon's official APIs by the fields each one returns and its price per 1,000 results, with the date each figure was checked.",
} satisfies EntryOptions;
