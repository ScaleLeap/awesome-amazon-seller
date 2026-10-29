import { existsSync, readFileSync } from "node:fs";
import { isRecord } from "./guards.ts";

/**
 * The links that failed the weekly link check. The key is the URL. The value is the date of the
 * first failed check, as `YYYY-MM-DD`.
 */
export type LinkHealth = Readonly<Record<string, string>>;

/**
 * Number of days that the main URL of an entry can fail the weekly link check before the job
 * removes the entry. With a weekly check, an entry must fail two checks in a row.
 */
export const LINK_GRACE_DAYS = 7;

/**
 * Number of milliseconds in one day.
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Number of characters in a `YYYY-MM-DD` date.
 */
const DATE_LENGTH = 10;

/**
 * Tells if a value is a link health record.
 */
export function isLinkHealth(value: unknown): value is LinkHealth {
  return isRecord(value) && Object.values(value).every((date) => typeof date === "string");
}

/**
 * Reads the link health file. Gives an empty record when the file does not exist.
 *
 * @throws if the file is not a JSON object of dates
 */
export function readLinkHealth(file: string): LinkHealth {
  if (!existsSync(file)) {
    return {};
  }

  const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));

  if (!isLinkHealth(parsed)) {
    throw new Error(`${file} must be a JSON object of URLs and dates.`);
  }

  return parsed;
}

/**
 * Makes the `YYYY-MM-DD` text of a date.
 */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, DATE_LENGTH);
}

/**
 * Input of a link health update.
 */
export interface LinkHealthUpdate {
  /**
   * The link health before the check.
   */
  readonly health: LinkHealth;

  /**
   * All URLs that the check examined.
   */
  readonly checkedUrls: readonly string[];

  /**
   * The URLs that failed the check.
   */
  readonly deadUrls: ReadonlySet<string>;

  /**
   * Date of the check.
   */
  readonly today: Date;

  /**
   * Number of days that a link can fail before it expires.
   */
  readonly graceDays: number;
}

/**
 * Result of a link health update.
 */
export interface LinkHealthResult {
  /**
   * The link health after the check. It has only the URLs that failed this check.
   */
  readonly health: LinkHealth;

  /**
   * URLs that failed this check for the first time.
   */
  readonly newlyDead: string[];

  /**
   * URLs that failed for `graceDays` or more.
   */
  readonly expired: string[];
}

/**
 * Updates the link health with the result of a link check.
 *
 * A URL that failed keeps the date of its first failure. A URL that passed, or that is not in
 * the list any more, leaves the record. A URL expires when it failed for `graceDays` or more.
 */
export function updateLinkHealth(update: LinkHealthUpdate): LinkHealthResult {
  const today = formatDate(update.today);
  const health: Record<string, string> = {};
  const newlyDead: string[] = [];
  const expired: string[] = [];

  for (const url of new Set(update.checkedUrls)) {
    if (!update.deadUrls.has(url)) {
      continue;
    }

    const since = update.health[url];

    if (since === undefined) {
      newlyDead.push(url);
    }

    health[url] = since ?? today;

    const days = (update.today.getTime() - new Date(health[url]).getTime()) / MS_PER_DAY;

    if (days >= update.graceDays) {
      expired.push(url);
    }
  }

  return {
    health,
    newlyDead,
    expired,
  };
}

/**
 * Gives the URLs that lychee reported as failed or timed out, from its JSON output.
 */
export function deadUrlsFromLychee(report: unknown): Set<string> {
  const urls = new Set<string>();

  if (!isRecord(report)) {
    return urls;
  }

  for (const key of [
    "error_map",
    "timeout_map",
  ]) {
    const map = report[key];

    if (!isRecord(map)) {
      continue;
    }

    for (const responses of Object.values(map)) {
      if (!Array.isArray(responses)) {
        continue;
      }

      for (const response of responses) {
        if (isRecord(response) && typeof response.url === "string") {
          urls.add(response.url);
        }
      }
    }
  }

  return urls;
}
