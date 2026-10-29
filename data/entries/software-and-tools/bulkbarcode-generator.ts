import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "BulkBarcode Generator" entry.
 */
export const entry = {
  name: "BulkBarcode Generator",
  url: "https://bulkbarcode-generator.com",
  description: "Makes FNSKU, UPC, EAN-13, Code 128 and QR labels in bulk from an Excel or CSV file, and exports print-ready PDF rolls for thermal printers. Runs in the browser. Free plan.",
} satisfies EntryOptions;
