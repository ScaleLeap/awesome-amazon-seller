import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Trends MCP" entry.
 */
export const entry = {
  name: "Trends MCP",
  url: "https://www.trendsmcp.ai",
  description: "MCP server and REST API with trend data from Amazon, Google Search, Google Shopping, TikTok, YouTube and other sources, for demand research in an AI assistant. Free plan with 100 requests a month.",
  links: [
    {
      label: "GitHub",
      url: "https://github.com/trendsmcp-ai/Trends-MCP",
    },
  ],
} satisfies EntryOptions;
