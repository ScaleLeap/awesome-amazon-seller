import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "BuyWhere" entry.
 */
export const entry = {
  name: "BuyWhere",
  url: "https://buywhere.ai",
  description: "Real-time product search, price comparison, and deal discovery across Amazon, Best Buy, Walmart, and Target via MCP. 150M+ products, 88K+ merchants. Free API and CLI.",
  links: [
    {
      label: "GitHub",
      url: "https://github.com/BuyWhere/buywhere-mcp",
    },
  ],
} satisfies EntryOptions;
