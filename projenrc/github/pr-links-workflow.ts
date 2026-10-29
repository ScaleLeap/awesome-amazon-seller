import { Component, github } from "projen";
import { ACTIONS } from "./actions.ts";
import { lycheeArgs } from "./lychee.ts";
import { RUNS_ON, checkoutStep } from "./steps.ts";

/**
 * Options for the workflow that checks the links of a pull request.
 */
export interface PrLinksWorkflowOptions {
  /**
   * Folder of the entry files, relative to the repository root, for example "data/entries".
   */
  readonly entriesPath: string;
}

/**
 * File that the workflow writes the URLs of the changed entries to.
 */
const URLS_FILE = "urls.txt";

/**
 * Workflow that checks the links of the entry files that a pull request adds or changes. It
 * does not check the links of the other entries, so a dead link elsewhere in the list does not
 * block a pull request.
 */
export class PrLinksWorkflow extends Component {
  /**
   * Creates the workflow.
   */
  constructor(gitHub: github.GitHub, options: PrLinksWorkflowOptions) {
    super(gitHub.project, "PrLinksWorkflow");

    const workflow = gitHub.addWorkflow("pr-links");

    workflow.on({
      pullRequest: {
        paths: [
          `${options.entriesPath}/**`,
        ],
      },
    });

    workflow.addJob("links", {
      runsOn: RUNS_ON,
      permissions: {
        contents: github.workflows.JobPermission.READ,
      },
      steps: [
        checkoutStep({
          fetchDepth: 0,
        }),
        {
          name: "Find the URLs of the changed entries",
          id: "urls",
          run: [
            `files=$(git diff --name-only --diff-filter=AM "origin/$GITHUB_BASE_REF...HEAD" -- "${options.entriesPath}")`,
            `if [ -n "$files" ]; then grep -ohE 'https?://[^"]+' $files | sort -u > ${URLS_FILE}; else : > ${URLS_FILE}; fi`,
            `cat ${URLS_FILE}`,
            `echo "count=$(wc -l < ${URLS_FILE} | tr -d ' ')" >> "$GITHUB_OUTPUT"`,
          ].join("\n"),
        },
        {
          name: "Check the links",
          if: "steps.urls.outputs.count != '0'",
          uses: ACTIONS.lychee,
          with: {
            args: lycheeArgs(URLS_FILE),
            fail: true,
            jobSummary: true,
          },
        },
      ],
    });
  }
}
