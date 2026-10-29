import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "amztool" entry.
 */
export const entry = {
  name: "amztool",
  url: "https://amztool.me",
  description: "Open-web Sponsored Products bulk-sheet generator. Reusable keyword dictionaries, one-click ad-group cloning, exports upload-ready .xlsx. Free tier. A companion open spec describes the schema.",
  links: [
    {
      label: "Open spec",
      url: "https://github.com/lizhl6/amazon-sp-bulk-sheet-spec",
    },
  ],
} satisfies EntryOptions;
