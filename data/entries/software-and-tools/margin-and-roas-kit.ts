import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Margin and ROAS Kit" entry.
 */
export const entry = {
  name: "Margin and ROAS Kit",
  url: "https://quietstack-labs.github.io/ecommerce-margin-roas-kit/",
  description:
    "Free, open-source browser calculator for per-order profit, break-even ROAS, ACoS and CPA after platform, payment and return costs, with a bulk SKU CSV mode. No sign-up.",
  links: [
    {
      label: "GitHub",
      url: "https://github.com/quietstack-labs/ecommerce-margin-roas-kit",
    },
  ],
} satisfies EntryOptions;
