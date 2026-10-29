import {
  descriptionLengthRule,
  descriptionLinksRule,
  descriptionPunctuationRule,
  descriptionRepeatsNameRule,
} from "./description.ts";
import type { IRule } from "./rule.ts";
import { duplicateUrlRule, httpsRule, trackingParametersRule, validUrlRule } from "./url.ts";

export * from "./rule.ts";

/**
 * The rules that every entry of the list must pass.
 */
export const DEFAULT_RULES: readonly IRule[] = [
  descriptionPunctuationRule,
  descriptionRepeatsNameRule,
  descriptionLengthRule,
  descriptionLinksRule,
  validUrlRule,
  httpsRule,
  trackingParametersRule,
  duplicateUrlRule,
];
