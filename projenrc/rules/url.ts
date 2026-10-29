import type { IEntry } from "../entry.ts";
import { entryPath, entryRule, type IRule } from "./rule.ts";

/**
 * Query parameters that affiliate programs and campaign trackers add to a URL.
 */
const TRACKING_PARAMETERS = /^(ref|ref_id|aff|aff_id|affiliate|affiliate_id|via|fpr|tag|utm_.+)$/i;

/**
 * Prefix of a host name that does not change the site.
 */
const WWW_PREFIX = /^www\./;

/**
 * Slashes at the end of a path.
 */
const TRAILING_SLASHES = /\/+$/;

/**
 * Gives all the URLs of an entry: its main URL and its extra links.
 */
function entryUrls(entry: IEntry): string[] {
  return [
    entry.url,
    ...entry.links.map((link) => link.url),
  ];
}

/**
 * Parses a URL, or gives `undefined` when it is not a valid URL.
 */
function parseUrl(url: string): URL | undefined {
  return URL.canParse(url) ? new URL(url) : undefined;
}

/**
 * Makes a URL that is the same for small differences, such as "www.", upper case in the host,
 * a slash at the end, or a hash.
 */
export function normalizeUrl(url: string): string {
  const parsed = parseUrl(url);

  if (!parsed) {
    return url;
  }

  const host = parsed.hostname.replace(WWW_PREFIX, "");
  const path = parsed.pathname.replace(TRAILING_SLASHES, "");

  return `${host}${path}${parsed.search}`;
}

/**
 * All URLs of the entry are valid.
 */
export const validUrlRule = entryRule({
  id: "valid-url",
  level: "error",
  test: (entry) => entryUrls(entry).every((url) => parseUrl(url) !== undefined),
  message: () => "Use a full, valid URL, for example \"https://example.com\".",
});

/**
 * All URLs of the entry use HTTPS.
 */
export const httpsRule = entryRule({
  id: "https",
  level: "warning",
  test: (entry) => entryUrls(entry).every((url) => parseUrl(url)?.protocol !== "http:"),
  message: () => "Use an \"https://\" URL, if the site supports it.",
});

/**
 * No URL of the entry has affiliate or tracking parameters.
 */
export const trackingParametersRule = entryRule({
  id: "tracking-parameters",
  level: "error",
  test: (entry) => entryUrls(entry).every((url) => {
    const parameters = [
      ...(parseUrl(url)?.searchParams.keys() ?? []),
    ];

    return !parameters.some((parameter) => TRACKING_PARAMETERS.test(parameter));
  }),
  message: () => "Remove the affiliate or tracking parameters from the URL.",
});

/**
 * No two entries have the same main URL.
 */
export const duplicateUrlRule: IRule = {
  id: "duplicate-url",
  check: (list) => {
    const firstByUrl = new Map<string, IEntry>();

    return list.entries.flatMap((entry) => {
      const key = normalizeUrl(entry.url);
      const first = firstByUrl.get(key);

      if (!first) {
        firstByUrl.set(key, entry);
        return [];
      }

      return [
        {
          rule: "duplicate-url",
          level: "error",
          entry: entryPath(entry),
          message: `The URL is already in the list as "${entryPath(first)}".`,
        },
      ];
    });
  },
};
