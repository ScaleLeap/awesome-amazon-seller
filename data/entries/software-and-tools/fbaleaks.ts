import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Fbaleaks" entry.
 */
export const entry = {
  name: "Fbaleaks",
  url: "https://fbaleaks.com",
  description: "Audits FBA inventory and reimbursement reports in the browser. Finds lost or damaged units that Amazon did not reimburse, sorts SKUs to keep, reprice or remove, and drafts appeal letters. Free tools and a one-time paid audit.",
} satisfies EntryOptions;
