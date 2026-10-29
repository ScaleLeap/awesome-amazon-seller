import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "VNCNT Labs Keyword Research" entry.
 */
export const entry = {
  name: "VNCNT Labs Keyword Research",
  url: "https://apify.com/vncntlabs/keyword-ideas",
  description: "Reverse ASIN (the Amazon keywords any ASIN ranks for) and keyword ideas from a seed via Amazon related searches and Google autocomplete, with search volume, CPC, difficulty and a USPTO trademark flag. Runs on Apify, pay per result from $0.002 per keyword, no subscription.",
} satisfies EntryOptions;
