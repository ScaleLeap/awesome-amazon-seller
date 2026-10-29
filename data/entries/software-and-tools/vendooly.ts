import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Vendooly" entry.
 */
export const entry = {
  name: "Vendooly",
  url: "https://vendooly.com/en/",
  description: "MCP connector that brings Seller Central and Amazon Ads into ChatGPT and Claude through the official Amazon APIs. The AI prepares each change with a before/after preview and it runs only after your approval. 14-day free trial.",
} satisfies EntryOptions;
