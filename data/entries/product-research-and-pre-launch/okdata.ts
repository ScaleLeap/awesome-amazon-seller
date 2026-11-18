import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "okdata" entry.
 */
export const entry = {
  name: "okdata",
  url: "https://okdata.online/",
  description: "REST API and MCP server for Amazon product search, details, reviews and Best Sellers in 22 Amazon stores, plus 1688, Taobao and AliExpress listings, suppliers and buyer reviews. Pay per call.",
  links: [
    {
      label: "GitHub",
      url: "https://github.com/okdataapi/okdata",
    },
  ],
} satisfies EntryOptions;
