import { isRecord } from "../guards.ts";
import { escapeCell } from "./render-report.ts";

/**
 * What the AI review suggests for one entry.
 */
export type TriageVerdict = "accept" | "discuss" | "reject";

/**
 * The verdicts that the AI review can give.
 */
export const TRIAGE_VERDICTS: readonly TriageVerdict[] = [
  "accept",
  "discuss",
  "reject",
];

/**
 * The AI review of one entry file.
 */
export interface TriageEntry {
  /**
   * Path of the entry file.
   */
  readonly file: string;

  /**
   * What the review suggests for the entry.
   */
  readonly verdict: TriageVerdict;

  /**
   * Short reasons for the verdict.
   */
  readonly notes: string;
}

/**
 * The structured result of the AI review.
 */
export interface TriageResult {
  /**
   * One or two sentences about the full pull request.
   */
  readonly summary: string;

  /**
   * The review of each added or changed entry file.
   */
  readonly entries: readonly TriageEntry[];
}

/**
 * JSON schema of `TriageResult`. Claude gives its result in this shape.
 */
export const TRIAGE_RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "entries",
  ],
  properties: {
    summary: {
      type: "string",
    },
    entries: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "file",
          "verdict",
          "notes",
        ],
        properties: {
          file: {
            type: "string",
          },
          verdict: {
            type: "string",
            enum: TRIAGE_VERDICTS,
          },
          notes: {
            type: "string",
          },
        },
      },
    },
  },
} as const;

/**
 * Text for each verdict in the table.
 */
const VERDICT_LABELS: Record<TriageVerdict, string> = {
  accept: "Accept",
  discuss: "Discuss",
  reject: "Reject",
};

/**
 * Number of characters of a commit SHA that the comment shows.
 */
const SHORT_SHA_LENGTH = 7;

/**
 * Tells if a value is a triage verdict.
 */
function isTriageVerdict(value: unknown): value is TriageVerdict {
  return TRIAGE_VERDICTS.some((verdict) => verdict === value);
}

/**
 * Tells if a value is the review of one entry file.
 */
function isTriageEntry(value: unknown): value is TriageEntry {
  return isRecord(value)
    && typeof value.file === "string"
    && isTriageVerdict(value.verdict)
    && typeof value.notes === "string";
}

/**
 * Tells if a value has the shape of a triage result.
 */
export function isTriageResult(value: unknown): value is TriageResult {
  return isRecord(value)
    && typeof value.summary === "string"
    && Array.isArray(value.entries)
    && value.entries.every(isTriageEntry);
}

/**
 * Makes the pull request comment of the AI review. All text from the review is escaped,
 * because the review reads text from the pull request and from the web.
 */
export function renderTriage(result: TriageResult, headSha: string): string {
  return [
    "## AI review",
    "",
    escapeCell(result.summary),
    "",
    ...(result.entries.length > 0
      ? [
        "| Entry | Verdict | Notes |",
        "| :-- | :-- | :-- |",
        ...result.entries.map((entry) => `| ${escapeCell(entry.file)} | ${VERDICT_LABELS[entry.verdict]} | ${escapeCell(entry.notes)} |`),
        "",
      ]
      : []),
    `<sub>This review is advisory. A maintainer makes the decision. Commit ${headSha.slice(0, SHORT_SHA_LENGTH)}.</sub>`,
    "",
  ].join("\n");
}
