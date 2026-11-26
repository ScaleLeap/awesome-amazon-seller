import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "EDIParse" entry.
 */
export const entry = {
  name: "EDIParse",
  url: "https://ediparse.com/",
  description: "Browser-local ANSI X12 EDI parser and converter for Amazon Vendor Central 850, 855, 856, 810, and 820 transactions. Exports Excel, QuickBooks IIF/QBO, and 4x6 GS1-128 SSCC-18 labels. Free plan.",
  links: [
    {
      label: "GitHub",
      url: "https://github.com/laozhang713/ansi-x12-edi-sample-files",
    },
  ],
} satisfies EntryOptions;
