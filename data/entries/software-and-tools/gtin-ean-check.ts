import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "GTIN & EAN Check" entry.
 */
export const entry = {
  name: "GTIN & EAN Check",
  url: "https://workspace.google.com/marketplace/app/gtin_ean_check/331681427270",
  description: "Google Sheets add-on that checks a column of EAN, UPC and GTIN codes for a wrong check digit or length, lost leading zeros, scientific notation, invisible characters and repeated codes. Adds a report sheet with the cell of each bad code, and sheet functions such as GTIN_CHECK. Free.",
} satisfies EntryOptions;
