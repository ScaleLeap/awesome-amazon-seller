/**
 * Writes the AI review comment from the structured output of Claude.
 *
 * The `ai-triage` workflow runs this file with plain Node.js on the default branch, with no
 * installed dependencies. For this reason, it imports only Node.js modules and types.
 *
 * Usage: `TRIAGE_OUTPUT=<json> node projenrc/report/triage-cli.ts --head-sha <sha> --out <file>`
 */
import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { isTriageResult, renderTriage } from "./render-triage.ts";

const { values } = parseArgs({
  options: {
    "head-sha": {
      type: "string",
    },
    "out": {
      type: "string",
    },
  },
});

const headSha = values["head-sha"];
const { out } = values;

if (!headSha || !out) {
  throw new Error("Give --head-sha and --out.");
}

const parsed: unknown = JSON.parse(process.env.TRIAGE_OUTPUT ?? "null");

if (!isTriageResult(parsed)) {
  throw new Error("TRIAGE_OUTPUT is not a valid triage result.");
}

writeFileSync(out, renderTriage(parsed, headSha));
