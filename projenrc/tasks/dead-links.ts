/**
 * Tasks of the weekly dead-link job.
 *
 * - `urls` writes all URLs of the list to a file, one URL on each line, for lychee.
 * - `apply` reads the JSON output of lychee, updates the link health file, and removes the
 *   entries whose main URL failed for the grace period. It writes a Markdown summary for the
 *   pull request.
 *
 * Usage:
 * `node projenrc/tasks/dead-links.ts urls --entries <dir> --out <file>`
 * `node projenrc/tasks/dead-links.ts apply --entries <dir> --report <file> --health <file> --summary <file>`
 */
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import { parseArgs } from "node:util";
import { entryUrls } from "../entry.ts";
import {
  LINK_GRACE_DAYS,
  deadUrlsFromLychee,
  readLinkHealth,
  updateLinkHealth,
  type LinkHealth,
} from "../link-health.ts";
import { loadEntries, type LoadedEntry } from "../load-entries.ts";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    entries: {
      type: "string",
    },
    out: {
      type: "string",
    },
    report: {
      type: "string",
    },
    health: {
      type: "string",
    },
    summary: {
      type: "string",
    },
  },
});

/**
 * Makes a Markdown list of URLs with the date of their first failure.
 */
function urlList(urls: readonly string[], health: LinkHealth): string[] {
  return urls.length === 0
    ? [
      "None.",
    ]
    : urls.map((url) => `- ${url} (fails since ${health[url]})`);
}

/**
 * Makes the Markdown summary of the pull request.
 */
function renderSummary(removed: readonly LoadedEntry[], newlyDead: readonly string[], stillDead: readonly string[], health: LinkHealth): string {
  return [
    "The weekly link check found these problems.",
    "",
    `### Removed entries (main URL failed for ${LINK_GRACE_DAYS} days or more)`,
    "",
    ...(removed.length === 0
      ? [
        "None.",
      ]
      : removed.map((entry) => `- ${entry.options.name}: ${entry.options.url} (fails since ${health[entry.options.url]})`)),
    "",
    "### Links that failed for the first time",
    "",
    ...urlList(newlyDead, health),
    "",
    "### Links that still fail",
    "",
    ...urlList(stillDead, health),
    "",
    "Before you merge, open each removed URL in a browser. If a site works, revert the removal of its entry file.",
    "",
  ].join("\n");
}

const [command] = positionals;
const { entries: entriesDir } = values;

if (!entriesDir) {
  throw new Error("Give --entries.");
}

const entries = await loadEntries(entriesDir);
const checkedUrls = [
  ...new Set(entries.flatMap((entry) => entryUrls(entry.options))),
];

if (command === "urls") {
  if (!values.out) {
    throw new Error("Give --out.");
  }

  writeFileSync(values.out, `${checkedUrls.join("\n")}\n`);
} else if (command === "apply") {
  const { report, health: healthFile, summary } = values;

  if (!report || !healthFile || !summary) {
    throw new Error("Give --report, --health and --summary.");
  }

  const result = updateLinkHealth({
    health: readLinkHealth(healthFile),
    checkedUrls,
    deadUrls: deadUrlsFromLychee(JSON.parse(readFileSync(report, "utf8"))),
    today: new Date(),
    graceDays: LINK_GRACE_DAYS,
  });

  const expired = new Set(result.expired);
  const removed = entries.filter((entry) => expired.has(entry.options.url));
  const removedUrls = new Set(removed.flatMap((entry) => entryUrls(entry.options)));

  for (const entry of removed) {
    rmSync(entry.file);
    console.log(`Removed ${relative(process.cwd(), entry.file)}`);
  }

  const health = Object.fromEntries(Object.entries(result.health)
    .filter(([url]) => !removedUrls.has(url))
    .sort(([a], [b]) => a.localeCompare(b)));
  const newlyDead = new Set(result.newlyDead);
  const stillDead = Object.keys(health).filter((url) => !newlyDead.has(url));

  writeFileSync(healthFile, `${JSON.stringify(health, undefined, 2)}\n`);
  writeFileSync(summary, renderSummary(removed, result.newlyDead, stillDead, result.health));
} else {
  throw new Error("Give the command \"urls\" or \"apply\".");
}
