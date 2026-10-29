import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { Component, type FileBase, type build, github } from "projen";
import { ACTIONS } from "./actions.ts";
import { RUNS_ON, checkoutStep, setupNodeStep } from "./steps.ts";

/**
 * Environment variable that tells the list validator where to write its findings.
 */
export const FINDINGS_FILE_ENV = "AWESOME_FINDINGS_FILE";

/**
 * Folder for the files of the report artifact. It is outside of the repository, so the
 * mutation check of the build does not see the files.
 */
const REPORT_DIR = "/tmp/pr-report";

/**
 * File of the findings of the list validator, in the report artifact.
 */
export const FINDINGS_FILE = `${REPORT_DIR}/findings.json`;

/**
 * File of the pull request number, in the report artifact.
 */
const PR_NUMBER_FILE = `${REPORT_DIR}/pr-number.txt`;

/**
 * File of the paths of the files that the pull request adds or changes.
 */
const CHANGED_FILE = `${REPORT_DIR}/changed.txt`;

/**
 * File that the report script writes the comment to.
 */
const REPORT_FILE = `${REPORT_DIR}/report.md`;

/**
 * Name of the artifact that carries the report files from the build to the report workflow.
 */
const ARTIFACT_NAME = "pr-report";

/**
 * Days that GitHub keeps the report artifact.
 */
const ARTIFACT_RETENTION_DAYS = 7;

/**
 * ID of the sticky comment. The report updates the comment with this ID, so a pull request has
 * one report comment only.
 */
const COMMENT_HEADER = "pr-report";

/**
 * Script that renders the report, as an absolute path.
 */
const REPORT_SCRIPT = fileURLToPath(new URL("../report/cli.ts", import.meta.url));

/**
 * A label that the report sets on a pull request.
 */
interface ReportLabel {
  /**
   * Name of the label.
   */
  readonly name: string;

  /**
   * Color of the label, as six hexadecimal digits.
   */
  readonly color: string;

  /**
   * Description of the label.
   */
  readonly description: string;
}

/**
 * Labels that the report sets on a pull request.
 */
const LABELS = {
  ready: {
    name: "ready",
    color: "0e8a16",
    description: "The list check passed",
  },
  needsChanges: {
    name: "needs-changes",
    color: "d93f0b",
    description: "The list check found problems",
  },
  newEntry: {
    name: "new-entry",
    color: "1d76db",
    description: "Adds an entry to the list",
  },
} as const satisfies Record<string, ReportLabel>;

/**
 * Options for the pull request report workflow.
 */
export interface PrReportWorkflowOptions {
  /**
   * The build workflow. The report workflow runs after it, and it adds the steps that upload
   * the report artifact.
   */
  readonly buildWorkflow: build.BuildWorkflow;

  /**
   * File that holds the Node.js version of the project.
   */
  readonly nodeVersionFile: FileBase;

  /**
   * Folder of the entry files, relative to the repository root, for example "data/entries".
   */
  readonly entriesPath: string;
}

/**
 * Posts the result of the build as one comment on the pull request, and sets the status labels.
 *
 * The build of a pull request from a fork gets a read-only token, so it cannot comment. For this
 * reason, the build uploads its findings as an artifact. Then this workflow runs on the default
 * branch with a write token. It reads only the artifact and the GitHub API, and never runs code
 * from the pull request.
 */
export class PrReportWorkflow extends Component {
  /**
   * Creates the workflow, and adds the upload steps to the build workflow.
   */
  constructor(gitHub: github.GitHub, options: PrReportWorkflowOptions) {
    super(gitHub.project, "PrReportWorkflow");

    options.buildWorkflow.addPostBuildSteps(
      {
        name: "Save the pull request number",
        if: "always() && github.event_name == 'pull_request'",
        env: {
          PR_NUMBER: "${{ github.event.pull_request.number }}",
        },
        run: [
          `mkdir -p ${REPORT_DIR}`,
          `echo "$PR_NUMBER" > ${PR_NUMBER_FILE}`,
        ].join("\n"),
      },
      {
        name: "Upload the report artifact",
        if: "always() && github.event_name == 'pull_request'",
        uses: ACTIONS.uploadArtifact,
        with: {
          "name": ARTIFACT_NAME,
          "path": REPORT_DIR,
          "retention-days": ARTIFACT_RETENTION_DAYS,
        },
      },
    );

    const workflow = gitHub.addWorkflow("pr-report");
    const event = "github.event.workflow_run";
    const labelCreateCommands = Object.values(LABELS).map((label) => `gh label create "${label.name}" --color "${label.color}" --description "${label.description}" --force`);

    workflow.on({
      workflowRun: {
        workflows: [
          options.buildWorkflow.name,
        ],
        types: [
          "completed",
        ],
      },
    });

    workflow.addJob("report", {
      runsOn: RUNS_ON,
      if: `${event}.event == 'pull_request' && (${event}.conclusion == 'success' || ${event}.conclusion == 'failure')`,
      permissions: {
        actions: github.workflows.JobPermission.READ,
        contents: github.workflows.JobPermission.READ,
        issues: github.workflows.JobPermission.WRITE,
        pullRequests: github.workflows.JobPermission.WRITE,
      },
      steps: [
        checkoutStep(),
        setupNodeStep({
          nodeVersionFile: options.nodeVersionFile,
        }),
        {
          name: "Download the report artifact",
          uses: ACTIONS.downloadArtifact,
          with: {
            "name": ARTIFACT_NAME,
            "path": REPORT_DIR,
            "run-id": `\${{ ${event}.id }}`,
            "github-token": "${{ github.token }}",
          },
        },
        {
          name: "Find the pull request",
          id: "pr",
          env: {
            GH_TOKEN: "${{ github.token }}",
            REPO: "${{ github.repository }}",
            HEAD_OWNER: `\${{ ${event}.head_repository.owner.login }}`,
            HEAD_BRANCH: `\${{ ${event}.head_branch }}`,
            HEAD_SHA: `\${{ ${event}.head_sha }}`,
          },
          run: [
            "number=$(gh api \"repos/$REPO/pulls?state=open&head=$HEAD_OWNER:$HEAD_BRANCH\" --jq \".[] | select(.head.sha == \\\"$HEAD_SHA\\\") | .number\")",
            "if [ -z \"$number\" ]; then",
            "  echo \"::notice::No open pull request has the commit $HEAD_SHA. A newer commit replaced it, or the pull request is closed.\"",
            "  exit 0",
            "fi",
            `if [ "$number" != "$(cat ${PR_NUMBER_FILE})" ]; then`,
            "  echo \"::error::The pull request number in the artifact does not agree with pull request $number.\"",
            "  exit 1",
            "fi",
            `gh api "repos/$REPO/pulls/$number/files" --paginate --jq '.[] | select(.status != "removed") | .filename' > ${CHANGED_FILE}`,
            `added=$(gh api "repos/$REPO/pulls/$number/files" --paginate --jq '.[] | select(.status == "added" and (.filename | startswith("${options.entriesPath}/"))) | .filename' | wc -l | tr -d ' ')`,
            "echo \"number=$number\" >> \"$GITHUB_OUTPUT\"",
            "echo \"added=$added\" >> \"$GITHUB_OUTPUT\"",
          ].join("\n"),
        },
        {
          name: "Render the report",
          id: "report",
          if: "steps.pr.outputs.number",
          env: {
            CONCLUSION: `\${{ ${event}.conclusion }}`,
            RUN_URL: `\${{ ${event}.html_url }}`,
            HEAD_SHA: `\${{ ${event}.head_sha }}`,
          },
          run: `node ${relative(gitHub.project.outdir, REPORT_SCRIPT)} --findings ${FINDINGS_FILE} --conclusion "$CONCLUSION" --run-url "$RUN_URL" --head-sha "$HEAD_SHA" --out ${REPORT_FILE} --changed ${CHANGED_FILE} --entries-path ${options.entriesPath}`,
        },
        {
          name: "Post the report",
          if: "steps.pr.outputs.number",
          uses: ACTIONS.stickyComment,
          with: {
            header: COMMENT_HEADER,
            number: "${{ steps.pr.outputs.number }}",
            path: REPORT_FILE,
          },
        },
        {
          name: "Set the labels",
          if: "steps.pr.outputs.number",
          env: {
            GH_TOKEN: "${{ github.token }}",
            GH_REPO: "${{ github.repository }}",
            NUMBER: "${{ steps.pr.outputs.number }}",
            STATUS: "${{ steps.report.outputs.status }}",
            ADDED: "${{ steps.pr.outputs.added }}",
          },
          run: [
            ...labelCreateCommands,
            `if [ "$STATUS" = "${LABELS.ready.name}" ]; then`,
            `  gh pr edit "$NUMBER" --add-label "${LABELS.ready.name}" --remove-label "${LABELS.needsChanges.name}"`,
            "else",
            `  gh pr edit "$NUMBER" --add-label "${LABELS.needsChanges.name}" --remove-label "${LABELS.ready.name}"`,
            "fi",
            "if [ \"$ADDED\" != \"0\" ]; then",
            `  gh pr edit "$NUMBER" --add-label "${LABELS.newEntry.name}"`,
            "fi",
          ].join("\n"),
        },
      ],
    });
  }
}
