/**
 * Writes the pull request report from the files of the build artifact.
 *
 * The `pr-report` workflow runs this file with plain Node.js on the default branch, with no
 * installed dependencies. For this reason, it imports only Node.js modules and types.
 *
 * Usage: `node projenrc/report/cli.ts --findings <file> --conclusion <success|failure>
 * --run-url <url> --head-sha <sha> --out <file> [--changed <file> --entries-path <path>]`
 *
 * `--changed` is a file with the paths of the files that the pull request adds or changes, one
 * path on each line. With it, the report shows only the findings of those entries, and the
 * errors of other entries.
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { posix } from "node:path";
import { parseArgs } from "node:util";
import { isFinding, type Finding } from "../rules/rule.ts";
import { renderReport, type BuildConclusion } from "./render-report.ts";

/**
 * Tells if a value is a build conclusion that the report supports.
 */
function isBuildConclusion(value: unknown): value is BuildConclusion {
  return value === "success" || value === "failure";
}

/**
 * Extension of an entry file.
 */
const ENTRY_FILE_EXTENSION = ".ts";

/**
 * Reads the changed files of the pull request, and gives the entry paths of the files in the
 * entries folder, for example "software-and-tools/acme-seller-tool".
 */
function readChangedEntries(file: string, entriesPath: string): Set<string> {
  const prefix = `${posix.normalize(entriesPath)}/`;

  return new Set(readFileSync(file, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith(prefix) && line.endsWith(ENTRY_FILE_EXTENSION))
    .map((line) => line.slice(prefix.length, -ENTRY_FILE_EXTENSION.length)));
}

/**
 * Reads the findings file. Gives `undefined` when the file is missing, because the build
 * stopped before the validator ran.
 *
 * @throws if the file is not a JSON array of findings
 */
function readFindings(file: string): Finding[] | undefined {
  if (!existsSync(file)) {
    return undefined;
  }

  const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));

  if (!Array.isArray(parsed) || !parsed.every(isFinding)) {
    throw new Error(`${file} is not a JSON array of findings.`);
  }

  return parsed;
}

const { values } = parseArgs({
  options: {
    "findings": {
      type: "string",
    },
    "conclusion": {
      type: "string",
    },
    "run-url": {
      type: "string",
    },
    "head-sha": {
      type: "string",
    },
    "out": {
      type: "string",
    },
    "changed": {
      type: "string",
    },
    "entries-path": {
      type: "string",
    },
  },
});

const { findings, conclusion, out } = values;
const runUrl = values["run-url"];
const headSha = values["head-sha"];
const entriesPath = values["entries-path"];

if (!findings || !isBuildConclusion(conclusion) || !runUrl || !headSha || !out) {
  throw new Error("Give --findings, --conclusion (success or failure), --run-url, --head-sha and --out.");
}

if (values.changed && !entriesPath) {
  throw new Error("Give --entries-path with --changed.");
}

const report = renderReport({
  findings: readFindings(findings),
  conclusion,
  runUrl,
  headSha,
  changedEntries: values.changed && entriesPath
    ? readChangedEntries(values.changed, entriesPath)
    : undefined,
});

writeFileSync(out, report.markdown);

/**
 * File of the step outputs of the current GitHub Actions step.
 */
const outputFile = process.env.GITHUB_OUTPUT;

if (outputFile) {
  appendFileSync(outputFile, `status=${report.status}\n`);
} else {
  console.log(`status=${report.status}`);
}
