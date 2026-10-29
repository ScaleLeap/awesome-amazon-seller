import { isRecord } from "../guards.ts";
import type { IAwesomeList } from "../awesome-list.ts";
import type { IEntry } from "../entry.ts";

/**
 * How serious a finding is. An error stops synth. A warning only shows a message.
 */
export type FindingLevel = "error" | "warning";

/**
 * The finding levels.
 */
const FINDING_LEVELS: readonly FindingLevel[] = [
  "error",
  "warning",
];

/**
 * A problem that a rule found in the list.
 */
export interface Finding {
  /**
   * ID of the rule that found the problem.
   */
  readonly rule: string;

  /**
   * How serious the problem is.
   */
  readonly level: FindingLevel;

  /**
   * Path of the entry with the problem, for example "software-and-tools/acme-seller-tool".
   */
  readonly entry: string;

  /**
   * Description of the problem and how to fix it.
   */
  readonly message: string;
}

/**
 * A check that runs on the full list.
 */
export interface IRule {
  /**
   * Stable ID of the rule, for example "description-punctuation".
   */
  readonly id: string;

  /**
   * Checks the list and returns the problems that it found.
   */
  check(list: IAwesomeList): Finding[];
}

/**
 * Gives the path of an entry that a finding shows, for example "software-and-tools/acme-seller-tool".
 */
export function entryPath(entry: IEntry): string {
  return `${entry.category.id}/${entry.slug}`;
}

/**
 * Options for a rule that checks each entry by itself.
 */
export interface EntryRuleOptions {
  /**
   * Stable ID of the rule.
   */
  readonly id: string;

  /**
   * How serious a failed check is.
   */
  readonly level: FindingLevel;

  /**
   * Returns true when the entry passes the check.
   */
  readonly test: (entry: IEntry) => boolean;

  /**
   * Describes the problem of an entry that fails the check.
   */
  readonly message: (entry: IEntry) => string;
}

/**
 * Makes a rule that checks each entry by itself.
 */
export function entryRule(options: EntryRuleOptions): IRule {
  return {
    id: options.id,
    check: (list) => list.entries
      .filter((entry) => !options.test(entry))
      .map((entry) => ({
        rule: options.id,
        level: options.level,
        entry: entryPath(entry),
        message: options.message(entry),
      })),
  };
}

/**
 * Tells if a value is a finding level.
 */
export function isFindingLevel(value: unknown): value is FindingLevel {
  return FINDING_LEVELS.some((level) => level === value);
}

/**
 * Tells if a value has the shape of a finding, for example after it was read from a JSON file.
 */
export function isFinding(value: unknown): value is Finding {
  return isRecord(value)
    && typeof value.rule === "string"
    && isFindingLevel(value.level)
    && typeof value.entry === "string"
    && typeof value.message === "string";
}
