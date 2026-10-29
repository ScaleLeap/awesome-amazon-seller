/**
 * Writes the pull request report from the files of the build artifact.
 *
 * The `pr-report` workflow runs this file with plain Node.js on the default branch, with no
 * installed dependencies. For this reason, it imports only Node.js modules and types.
 *
 * Usage: `node projenrc/report/cli.ts --findings <file> --conclusion <success|failure>
 * --run-url <url> --head-sha <sha> --out <file>`
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
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
  },
});

const { findings, conclusion, out } = values;
const runUrl = values["run-url"];
const headSha = values["head-sha"];

if (!findings || !isBuildConclusion(conclusion) || !runUrl || !headSha || !out) {
  throw new Error("Give --findings, --conclusion (success or failure), --run-url, --head-sha and --out.");
}

const report = renderReport({
  findings: readFindings(findings),
  conclusion,
  runUrl,
  headSha,
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
