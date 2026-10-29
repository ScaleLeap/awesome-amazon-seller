import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "USPTO Patent Public Search" entry.
 */
export const entry = {
  name: "USPTO Patent Public Search",
  url: "https://www.uspto.gov/patents/search/patent-public-search",
  description: "Official USPTO search tool for U.S. patents and patent application publications.",
} satisfies EntryOptions;
