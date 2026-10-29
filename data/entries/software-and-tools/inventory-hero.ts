import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Inventory Hero" entry.
 */
export const entry = {
  name: "Inventory Hero",
  url: "https://www.inventoryhero.ai",
  description: "Automated inventory management for Amazon FBA that forecasts demand, drafts restocks, and works inside Claude via MCP.",
} satisfies EntryOptions;
