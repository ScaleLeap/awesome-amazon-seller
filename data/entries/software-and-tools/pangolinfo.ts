import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Pangolinfo" entry.
 */
export const entry = {
  name: "Pangolinfo",
  url: "https://www.pangolinfo.com/amazon-data-mcp/",
  description: "MCP server and REST API exposing 19 read-only Amazon data tools: product details, reviews, keyword search, category and niche analysis, Best Sellers, New Releases, and seller storefronts, plus WIPO trademark and US PACER patent litigation lookups. Connects over Streamable HTTP; Python client available via `pip install pangolinfo-mcp`.",
} satisfies EntryOptions;
