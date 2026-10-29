import type { github } from "projen";
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
 * File that holds the Node.js version of the project.
 */
const NODE_VERSION_FILE = ".node-version";

/**
 * Step that checks out the repository, with no credentials left in the Git config.
 */
export function checkoutStep(): github.workflows.JobStep {
  return {
    name: "Check out",
    uses: ACTIONS.checkout,
    with: {
      "persist-credentials": false,
    },
  };
}

/**
 * Steps that install Node.js, pnpm and the dependencies. pnpm reads its version from the
 * `packageManager` field of `package.json`.
 */
export function installSteps(): github.workflows.JobStep[] {
  return [
    {
      name: "Set up pnpm",
      uses: ACTIONS.setupPnpm,
    },
    {
      name: "Set up Node.js",
      uses: ACTIONS.setupNode,
      with: {
        "node-version-file": NODE_VERSION_FILE,
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
export function setupSteps(): github.workflows.JobStep[] {
  return [
    checkoutStep(),
    ...installSteps(),
  ];
}
