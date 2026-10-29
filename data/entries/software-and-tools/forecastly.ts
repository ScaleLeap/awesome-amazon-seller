import type { EntryOptions } from "../../../projenrc/entry.ts";

/**
 * The "Forecastly" entry.
 */
export const entry = {
  name: "Forecastly",
  url: "https://www.forecast.ly/",
  description: "Predict future product demand, make fast and accurate buying decisions.",
} satisfies EntryOptions;
