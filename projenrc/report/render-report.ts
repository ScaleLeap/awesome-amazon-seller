import type { Finding, FindingLevel } from "../rules/rule.ts";

/**
 * Result of the build workflow run, as GitHub gives it in `workflow_run.conclusion`.
 */
export type BuildConclusion = "success" | "failure";

/**
 * Status label that the report gives to a pull request.
 */
export type ReportStatus = "ready" | "needs-changes";

/**
 * Input of the report.
 */
export interface ReportInput {
  /**
   * The findings of the list validator. `undefined` when the build stopped before the validator
   * ran, for example because of a TypeScript error.
   */
  readonly findings?: readonly Finding[];

  /**
   * Result of the build workflow run.
   */
  readonly conclusion: BuildConclusion;

  /**
   * Address of the build workflow run.
   */
  readonly runUrl: string;

  /**
   * Commit that the build checked.
   */
  readonly headSha: string;

  /**
   * Paths of the entries that the pull request adds or changes, in the form of a finding entry,
   * for example "software-and-tools/acme-seller-tool". The report shows the findings of these
   * entries, and the errors of other entries only.
   *
   * @default - all findings belong to the pull request
   */
  readonly changedEntries?: ReadonlySet<string>;
}

/**
 * The rendered report.
 */
export interface Report {
  /**
   * Markdown text of the pull request comment.
   */
  readonly markdown: string;

  /**
   * Status label for the pull request.
   */
  readonly status: ReportStatus;
}

/**
 * Number of characters of a commit SHA that the report shows.
 */
const SHORT_SHA_LENGTH = 7;

/**
 * Heading of the report comment.
 */
const HEADING = "## List check";

/**
 * Text for each finding level in the table.
 */
const LEVEL_LABELS: Record<FindingLevel, string> = {
  error: "Error",
  warning: "Warning",
};

/**
 * Makes text from a pull request safe for one cell of a Markdown table. The findings come from
 * code in the pull request, so the text cannot mention people, add HTML, or break the table.
 */
export function escapeCell(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[\\`*_[\]<>|]/g, (character) => `\\${character}`)
    .replace(/@/g, "@​");
}

/**
 * Makes the Markdown table of the findings, with the errors first.
 */
function renderTable(findings: readonly Finding[]): string[] {
  const sorted = [
    ...findings.filter((finding) => finding.level === "error"),
    ...findings.filter((finding) => finding.level === "warning"),
  ];

  return [
    "| Level | Entry | Rule | Problem |",
    "| :-- | :-- | :-- | :-- |",
    ...sorted.map((finding) => `| ${LEVEL_LABELS[finding.level]} | ${escapeCell(finding.entry)} | ${escapeCell(finding.rule)} | ${escapeCell(finding.message)} |`),
  ];
}

/**
 * Makes the summary sentence of the report.
 */
function renderSummary(input: ReportInput, errorCount: number, warningCount: number, otherErrorCount: number): string {
  if (errorCount > 0) {
    return `The entries have ${errorCount} error(s). Fix them, run \`npx projen\`, then push again.`;
  }

  if (otherErrorCount > 0) {
    return `The entries of this pull request have no errors. The build failed because ${otherErrorCount} error(s) are in other entries. A maintainer fixes those.`;
  }

  if (input.conclusion === "failure") {
    return [
      "The build failed, but the entry checks found no error.",
      `Usually, \`readme.md\` is not up to date, or a TypeScript file has an error. Run \`npx projen\`, commit all changed files, then push again. Read the [build log](${input.runUrl}) for the cause.`,
    ].join(" ");
  }

  if (warningCount > 0) {
    return `The build passed with ${warningCount} warning(s). A maintainer can ask you to fix them.`;
  }

  return "The build passed, and the entry checks found no problems.";
}

/**
 * Makes the pull request comment and the status label from the result of the build.
 */
export function renderReport(input: ReportInput): Report {
  const { changedEntries } = input;
  const allFindings = input.findings ?? [];
  const findings = changedEntries
    ? allFindings.filter((finding) => changedEntries.has(finding.entry))
    : allFindings;
  const otherErrors = changedEntries
    ? allFindings.filter((finding) => !changedEntries.has(finding.entry) && finding.level === "error")
    : [];
  const errorCount = findings.filter((finding) => finding.level === "error").length;
  const warningCount = findings.length - errorCount;
  const status: ReportStatus = errorCount > 0 || input.conclusion === "failure"
    ? "needs-changes"
    : "ready";

  const markdown = [
    HEADING,
    "",
    renderSummary(input, errorCount, warningCount, otherErrors.length),
    "",
    ...(findings.length > 0
      ? [
        ...renderTable(findings),
        "",
      ]
      : []),
    ...(otherErrors.length > 0
      ? [
        "### Errors in other entries",
        "",
        ...renderTable(otherErrors),
        "",
      ]
      : []),
    `<sub>Commit ${input.headSha.slice(0, SHORT_SHA_LENGTH)}. [Build log](${input.runUrl}).</sub>`,
    "",
  ].join("\n");

  return {
    markdown,
    status,
  };
}
