import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "bgnix" entry.
 */
export const entry = {
  name: "bgnix",
  url: "https://bgnix.com/",
  description: "Free browser-based background remover for product photos: white, transparent or coloured backgrounds, batch mode, no sign-up. Images are processed on the device and never uploaded; the AI model downloads on first use and is slow on old phones.",
} satisfies EntryOptions;
