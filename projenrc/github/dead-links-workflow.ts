import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { Component, type FileBase, github } from "projen";
import { ACTIONS } from "./actions.ts";
import { lycheeArgs } from "./lychee.ts";
import { RUNS_ON, checkoutStep, installSteps } from "./steps.ts";

/**
 * Options for the weekly dead-link workflow.
 */
export interface DeadLinksWorkflowOptions {
  /**
   * Folder of the entry files, relative to the repository root, for example "data/entries".
   */
  readonly entriesPath: string;

  /**
   * File of the links that failed the weekly link check, relative to the repository root.
   */
  readonly linkHealthPath: string;

  /**
   * The readme file. The pull request includes it, because synth changes it when an entry
   * goes.
   */
  readonly readme: FileBase;

  /**
   * File that holds the Node.js version of the project.
   */
  readonly nodeVersionFile: FileBase;
}

/**
 * Folder for the temporary files of the job. It is outside of the repository, so the pull
 * request does not include them.
 */
const WORK_DIR = "/tmp/dead-links";

/**
 * File of all URLs of the list.
 */
const URLS_FILE = `${WORK_DIR}/urls.txt`;

/**
 * File of the JSON output of lychee.
 */
const REPORT_FILE = `${WORK_DIR}/lychee.json`;

/**
 * File of the Markdown summary for the pull request.
 */
const SUMMARY_FILE = `${WORK_DIR}/summary.md`;

/**
 * When the job runs: each Monday at 06:00 UTC.
 */
const SCHEDULE = "0 6 * * 1";

/**
 * Branch of the pull request of the job. The job updates the same pull request until someone
 * merges or closes it.
 */
const BRANCH = "bot/dead-links";

/**
 * Script of the dead-link tasks, as an absolute path.
 */
const DEAD_LINKS_SCRIPT = fileURLToPath(new URL("../tasks/dead-links.ts", import.meta.url));

/**
 * Checks all links of the list each week, and opens a pull request with the result.
 *
 * The pull request updates the link health file. It also removes each entry whose main URL
 * failed for the grace period, and updates the readme to match.
 */
export class DeadLinksWorkflow extends Component {
  /**
   * Creates the tasks and the workflow.
   */
  constructor(gitHub: github.GitHub, options: DeadLinksWorkflowOptions) {
    super(gitHub.project, "DeadLinksWorkflow");

    const { project } = gitHub;
    const synthTask = project.defaultTask;

    if (!synthTask) {
      throw new Error("The dead-link workflow needs the default projen task, which synthesizes the readme.");
    }

    const script = `node ${relative(project.outdir, DEAD_LINKS_SCRIPT)}`;

    const urlsTask = project.addTask("dead-links:urls", {
      description: "Write all URLs of the list to a file for the link check",
      exec: `mkdir -p ${WORK_DIR} && ${script} urls --entries ${options.entriesPath} --out ${URLS_FILE}`,
    });

    const applyTask = project.addTask("dead-links:apply", {
      description: "Update the link health file and remove the entries with expired links",
      exec: `${script} apply --entries ${options.entriesPath} --report ${REPORT_FILE} --health ${options.linkHealthPath} --summary ${SUMMARY_FILE}`,
    });

    const workflow = gitHub.addWorkflow("dead-links");

    workflow.on({
      schedule: [
        {
          cron: SCHEDULE,
        },
      ],
      workflowDispatch: {},
    });

    workflow.addJob("dead-links", {
      runsOn: RUNS_ON,
      permissions: {
        contents: github.workflows.JobPermission.WRITE,
        pullRequests: github.workflows.JobPermission.WRITE,
      },
      steps: [
        checkoutStep(),
        ...installSteps({
          nodeVersionFile: options.nodeVersionFile,
        }),
        {
          name: "List the URLs",
          run: project.runTaskCommand(urlsTask),
        },
        {
          name: "Check the links",
          uses: ACTIONS.lychee,
          with: {
            args: lycheeArgs(URLS_FILE),
            format: "json",
            output: REPORT_FILE,
            fail: false,
            jobSummary: true,
          },
        },
        {
          name: "Update the link health",
          run: project.runTaskCommand(applyTask),
        },
        {
          name: "Update the readme",
          run: project.runTaskCommand(synthTask),
        },
        {
          name: "Open the pull request",
          uses: ACTIONS.createPullRequest,
          with: {
            "branch": BRANCH,
            "delete-branch": true,
            "commit-message": "fix: update the link health and remove dead links",
            "title": "Remove dead links",
            "body-path": SUMMARY_FILE,
            "add-paths": [
              options.entriesPath,
              options.linkHealthPath,
              options.readme.path,
            ].join("\n"),
          },
        },
      ],
    });
  }
}
