import type { FileBase, github } from "projen";
import { ACTIONS } from "./actions.ts";

/**
 * Runner that all jobs use.
 */
export const RUNS_ON = [
  "ubuntu-latest",
];

/**
 * Branch that pull requests merge into.
 */
export const DEFAULT_BRANCH = "master";

/**
 * Options for the steps that install the toolchain and the dependencies.
 */
export interface InstallStepsOptions {
  /**
   * File that holds the Node.js version of the project.
   */
  readonly nodeVersionFile: FileBase;
}

/**
 * Options for the step that checks out the repository.
 */
export interface CheckoutStepOptions {
  /**
   * Number of commits to get. 0 gets the full history, which `git diff` against the base branch
   * needs.
   *
   * @default 1
   */
  readonly fetchDepth?: number;

  /**
   * Branch, tag or commit to check out.
   *
   * @default - the commit that started the workflow
   */
  readonly ref?: string;
}

/**
 * Step that checks out the repository, with no credentials left in the Git config.
 */
export function checkoutStep(options: CheckoutStepOptions = {}): github.workflows.JobStep {
  return {
    name: "Check out",
    uses: ACTIONS.checkout,
    with: {
      "persist-credentials": false,
      ...(options.fetchDepth === undefined
        ? {}
        : {
          "fetch-depth": options.fetchDepth,
        }),
      ...(options.ref === undefined
        ? {}
        : {
          ref: options.ref,
        }),
    },
  };
}

/**
 * Steps that install Node.js, pnpm and the dependencies. pnpm reads its version from the
 * `packageManager` field of `package.json`.
 */
export function installSteps(options: InstallStepsOptions): github.workflows.JobStep[] {
  return [
    {
      name: "Set up pnpm",
      uses: ACTIONS.setupPnpm,
    },
    {
      name: "Set up Node.js",
      uses: ACTIONS.setupNode,
      with: {
        "node-version-file": options.nodeVersionFile.path,
        "cache": "pnpm",
      },
    },
    {
      name: "Install dependencies",
      run: "pnpm install --frozen-lockfile",
    },
  ];
}

/**
 * Steps that check out the repository, then install Node.js, pnpm and the dependencies.
 */
export function setupSteps(options: InstallStepsOptions): github.workflows.JobStep[] {
  return [
    checkoutStep(),
    ...installSteps(options),
  ];
}
