import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Utlista" entry.
 */
export const entry = {
  name: "Utlista",
  url: "https://www.utlista.com",
  description: "Turns a product catalogue into Amazon listings for seven EU marketplaces. Writes the title, bullets, description and backend search terms for each marketplace, and checks each field against Amazon's limits. Exports a flat file per marketplace. Free for ten products.",
} satisfies EntryOptions;
