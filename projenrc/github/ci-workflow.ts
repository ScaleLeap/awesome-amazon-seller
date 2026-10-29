import { Component, github } from "projen";
import { RUNS_ON, setupSteps } from "./steps.ts";

/**
 * Branch that pull requests merge into.
 */
const DEFAULT_BRANCH = "master";

/**
 * The CI workflow. It builds the project on each pull request and on each push to the default
 * branch: type check, synth with validation, tests and awesome-lint. It fails when a pull
 * request does not include the files that synth writes, such as `readme.md`.
 */
export class CiWorkflow extends Component {
  /**
   * The GitHub workflow.
   */
  public readonly workflow: github.GithubWorkflow;

  /**
   * Creates the CI workflow.
   */
  constructor(gitHub: github.GitHub) {
    super(gitHub.project, "CiWorkflow");

    this.workflow = new github.GithubWorkflow(gitHub, "ci");
    this.workflow.on({
      pullRequest: {},
      push: {
        branches: [
          DEFAULT_BRANCH,
        ],
      },
      workflowDispatch: {},
    });

    this.workflow.addJob("build", {
      runsOn: RUNS_ON,
      permissions: {
        contents: github.workflows.JobPermission.READ,
      },
      steps: [
        ...setupSteps(),
        {
          name: "Build",
          run: "pnpm exec projen build",
        },
        {
          name: "Check that the generated files are up to date",
          run: [
            "git add --all",
            "git diff --staged --exit-code || {",
            "  echo '::error::The generated files are out of date. Run \"npx projen\", then commit all changed files.'",
            "  exit 1",
            "}",
          ].join("\n"),
        },
      ],
    });
  }
}
