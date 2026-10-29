import { entryUrls } from "../entry.ts";
import type { LinkHealth } from "../link-health.ts";
import { entryRule, type IRule } from "./rule.ts";

/**
 * Options for the link health rule.
 */
export interface LinkHealthRuleOptions {
  /**
   * The links that failed the weekly link check.
   */
  readonly health: LinkHealth;

  /**
   * Number of days that a link can fail before the weekly job removes its entry.
   */
  readonly graceDays: number;
}

/**
 * Gives a warning for each entry with a link that failed the weekly link check.
 */
export function linkHealthRule(options: LinkHealthRuleOptions): IRule {
  /**
   * Gives the failed links of an entry, with the date of the first failure.
   */
  const failedLinks = (urls: string[]) => urls
    .filter((url) => options.health[url] !== undefined)
    .map((url) => `${url} (since ${options.health[url]})`);

  return entryRule({
    id: "link-health",
    level: "warning",
    test: (entry) => failedLinks(entryUrls(entry)).length === 0,
    message: (entry) => `A link failed the weekly link check: ${failedLinks(entryUrls(entry)).join(", ")}. If the main URL fails for ${options.graceDays} days, the weekly job removes the entry.`,
  });
}
