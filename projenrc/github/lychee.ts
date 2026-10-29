/**
 * HTTP status codes that lychee accepts as a working link.
 *
 * Some sites block bots with 403 or a challenge page, but work in a browser. LinkedIn and some
 * other sites send 999 to bots, and 429 is a rate limit. None of these show that a link is
 * dead.
 */
const ACCEPTED_STATUS_CODES = "200..=299,403,429,999";

/**
 * Number of times lychee tries a link again before it marks the link as failed.
 */
const MAX_RETRIES = 2;

/**
 * Seconds that lychee waits for a response.
 */
const TIMEOUT_SECONDS = 30;

/**
 * User agent of a desktop browser. Some sites refuse requests with the default lychee user
 * agent.
 */
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

/**
 * Makes the arguments of a lychee run on the given inputs. All lychee runs of the project use
 * these settings, so that they agree on which links are dead.
 */
export function lycheeArgs(...inputs: string[]): string {
  return [
    "--no-progress",
    `--accept '${ACCEPTED_STATUS_CODES}'`,
    `--max-retries ${MAX_RETRIES}`,
    `--timeout ${TIMEOUT_SECONDS}`,
    `--user-agent '${USER_AGENT}'`,
    ...inputs,
  ].join(" ");
}
