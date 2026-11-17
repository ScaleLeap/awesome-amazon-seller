import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "PlushSource" entry.
 */
export const entry = {
  name: "PlushSource",
  url: "https://plushsource.com",
  description: "Independent directory of 55 custom plush toy manufacturers for private-label sourcing, with MOQ, lead times, OEM/ODM services and claimed certifications taken from each manufacturer's own website. Free; an open-source MCP server lets AI assistants search the same data.",
  links: [
    {
      label: "GitHub",
      url: "https://github.com/quickman924/plushsource-mcp",
    },
  ],
} satisfies EntryOptions;
