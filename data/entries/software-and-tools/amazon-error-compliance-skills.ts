import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "amazon-error-compliance-skills" entry.
 */
export const entry = {
  name: "amazon-error-compliance-skills",
  url: "https://github.com/inchTodd/amazon-error-compliance-skills",
  description: "MIT-licensed agent skills (Claude, Cursor) that pre-check deal and Prime Exclusive Discount prices, explain coupon errors and triage listing upload error codes from numbers the seller types in. Runs locally and asks for no Seller Central or SP-API credentials.",
} satisfies EntryOptions;
