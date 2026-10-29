import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "TranslateMyImage" entry.
 */
export const entry = {
  name: "TranslateMyImage",
  url: "https://translatemyimage.com/amazon-image-translator",
  description: "Translates the text inside product images, infographics, A+ modules and size charts into other languages, and keeps the original layout. Works from the final JPG or PNG files. Three free test images.",
} satisfies EntryOptions;
