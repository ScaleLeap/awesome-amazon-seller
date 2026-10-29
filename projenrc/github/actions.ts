import type { github } from "projen";

/**
 * Names of the GitHub Actions that the workflows use. A step refers to an action by its name
 * only. `pinActions()` sets the commit that the name resolves to.
 */
export const ACTIONS = {
  checkout: "actions/checkout",
  setupNode: "actions/setup-node",
  setupPnpm: "pnpm/action-setup",
  uploadArtifact: "actions/upload-artifact",
  downloadArtifact: "actions/download-artifact",
  lychee: "lycheeverse/lychee-action",
  claudeCode: "anthropics/claude-code-action",
  createPullRequest: "peter-evans/create-pull-request",
  stickyComment: "marocchino/sticky-pull-request-comment",
} as const;

/**
 * Name of an action in `ACTIONS`.
 */
type ActionName = (typeof ACTIONS)[keyof typeof ACTIONS];

/**
 * The commit of each action. A commit SHA, not a tag, so that a changed tag cannot change the
 * code that runs. The comment gives the tag of the commit.
 */
const ACTION_PINS: Record<ActionName, string> = {
  // v7.0.1
  "actions/checkout": "3d3c42e5aac5ba805825da76410c181273ba90b1",
  // v7.0.0
  "actions/setup-node": "820762786026740c76f36085b0efc47a31fe5020",
  // v6.0.10
  "pnpm/action-setup": "0977fd99725f1db4007ccb2928dbb4e90d06cc86",
  // v7.0.2
  "actions/upload-artifact": "cf430e030ddbb5b0abf93d22962f4752f3646cd9",
  // v8.0.2
  "actions/download-artifact": "9000827ccba6bdab643e8b6fd33ac0654aef8333",
  // v2.9.0
  "lycheeverse/lychee-action": "e7477775783ea5526144ba13e8db5eec57747ce8",
  // v1.0.263
  "anthropics/claude-code-action": "8041f1d17e0e7d2f2cfe35002962e9f26237c0bb",
  // v8.1.1
  "peter-evans/create-pull-request": "5f6978faf089d4d20b00c7766989d076bb2fc7f1",
  // v3.0.5
  "marocchino/sticky-pull-request-comment": "5770ad5eb8f42dd2c4f34da00c94c5381e49af88",
};

/**
 * Pins each action in `ACTIONS` to its commit, for all workflows of the project.
 */
export function pinActions(gitHub: github.GitHub): void {
  for (const [action, sha] of Object.entries(ACTION_PINS)) {
    gitHub.actions.set(action, `${action}@${sha}`);
  }
}
