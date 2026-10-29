import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "ForecastRx" entry.
 */
export const entry = {
  name: "ForecastRx",
  url: "https://www.forecastrx.com/",
  description: "Inventory forecasting solution. Projects future demand so you can purchase the right product, in the right quantity, at the right time.",
} satisfies EntryOptions;
