import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Utlista" entry.
 */
export const entry = {
  name: "Utlista",
  url: "https://www.utlista.com",
  description: "Localises an existing product catalogue into Amazon listings for seven EU marketplaces (de, fr, it, es, nl, pl, se). Writes title, five bullets, description and backend search terms per destination marketplace rather than translating them, and validates every field against Amazon's limits before export, including search terms counted in bytes. Produces a flat file per marketplace; it does not upload to Amazon. Free for ten products.",
} satisfies EntryOptions;
