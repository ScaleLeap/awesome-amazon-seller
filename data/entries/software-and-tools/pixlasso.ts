import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "PixLasso" entry.
 */
export const entry = {
  name: "PixLasso",
  url: "https://pixlasso.com/",
  description: "Chrome and Edge extension that saves the images of a product page, or of many open listings, in one ZIP at the largest size it finds, with one folder per product. Converts WebP to JPG or PNG locally. Free up to 30 images per batch; Pro is a one-time $9.99.",
} satisfies EntryOptions;
