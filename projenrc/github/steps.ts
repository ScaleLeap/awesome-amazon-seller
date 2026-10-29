import type { github } from "projen";
import { ACTIONS } from "./actions.ts";

/**
 * Runner that all jobs use.
 */
export const RUNS_ON = [
  "ubuntu-latest",
];

/**
 * File that holds the Node.js version of the project.
 */
const NODE_VERSION_FILE = ".node-version";

/**
 * Steps that check out the repository and install Node.js, pnpm and the dependencies.
 * pnpm reads its version from the `packageManager` field of `package.json`.
 */
export function setupSteps(): github.workflows.JobStep[] {
  return [
    {
      name: "Check out",
      uses: ACTIONS.checkout,
      with: {
        "persist-credentials": false,
      },
    },
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
