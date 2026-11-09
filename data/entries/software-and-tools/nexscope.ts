import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Nexscope" entry.
 */
export const entry = {
  name: "Nexscope",
  url: "https://www.nexscope.ai/?co-from=scaleleap-awesome-amazon-seller",
  description: "Ecommerce product research REST API and remote MCP for Amazon and marketplace product data. Self-serve API key with 1,000 trial credits, then paid.",
  links: [
    {
      label: "GitHub",
      url: "https://github.com/nexscope-ai/nexscope-ecommerce-api",
    },
    {
      label: "Docs",
      url: "https://www.nexscope.ai/api-docs?co-from=scaleleap-awesome-amazon-seller",
    },
  ],
} satisfies EntryOptions;
