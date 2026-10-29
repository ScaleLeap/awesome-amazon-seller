import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "ChineseCheck" entry.
 */
export const entry = {
  name: "ChineseCheck",
  url: "https://chinesecheck.com",
  description: "Verify a Chinese supplier before paying: look up the company by English name, Chinese name or Unified Social Credit Code and read its registration record in English for free; paid reports add court enforcement, litigation and penalty records.",
} satisfies EntryOptions;
