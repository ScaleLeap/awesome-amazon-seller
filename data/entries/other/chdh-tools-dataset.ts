import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "chdh-tools-dataset" entry.
 */
export const entry = {
  name: "chdh-tools-dataset",
  url: "https://github.com/launotice-lang/chdh-tools-dataset",
  description: "Open dataset (CC BY 4.0) of 1,210 cross-border e-commerce tools, including major Amazon seller tools (Helium 10, Jungle Scout, Keepa, FastMoss). JSON/CSV format with categories, pricing, and editorial ratings.",
} satisfies EntryOptions;
