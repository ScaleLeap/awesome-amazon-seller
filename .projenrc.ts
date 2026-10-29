import { join } from "node:path";
import { Project, TextFile, build, github, javascript, typescript } from "projen";
import { CATEGORIES } from "./data/categories.ts";
import { AwesomeList } from "./projenrc/awesome-list.ts";
import { Category } from "./projenrc/category.ts";
import { Entry } from "./projenrc/entry.ts";
import { pinActions } from "./projenrc/github/actions.ts";
import { PrLinksWorkflow } from "./projenrc/github/pr-links-workflow.ts";
import { DEFAULT_BRANCH, RUNS_ON, installSteps } from "./projenrc/github/steps.ts";
import { ContributionTemplates } from "./projenrc/github/templates.ts";
import { ListValidator } from "./projenrc/list-validator.ts";
import { loadEntries } from "./projenrc/load-entries.ts";
import { DEFAULT_RULES } from "./projenrc/rules/index.ts";

/**
 * Version of pnpm that the project uses.
 */
const PNPM_VERSION = "12.16.1";

/**
 * Node.js version that the project uses. Native type stripping in this version runs `.projenrc.ts`
 * with no extra runner.
 */
const NODE_VERSION = "26.13.0";

/**
 * The awesome list project.
 */
const project = new Project({
  name: "awesome-amazon-seller",
  projenrcJson: false,
});

/**
 * Web address of the GitHub repository.
 */
const REPOSITORY_URL = "https://github.com/ScaleLeap/awesome-amazon-seller";

/**
 * The `package.json` of the project.
 */
const nodePackage = new javascript.NodePackage(project, {
  packageName: "awesome-amazon-seller",
  description: "A curated list of tools and resources for Amazon sellers.",
  license: "CC0-1.0",
  packageManager: javascript.NodePackageManager.PNPM,
  pnpmVersion: PNPM_VERSION,
  minNodeVersion: NODE_VERSION,
  repository: `${REPOSITORY_URL}.git`,
  entrypoint: "",
  npmProvenance: false,
  devDeps: [
    "@types/node",
    "awesome-lint",
    "constructs",
    "projen",
    "typescript",
    "vitest",
  ],
});

nodePackage.addField("private", true);
nodePackage.addField("type", "module");

/**
 * File that tells version managers and `actions/setup-node` which Node.js version to use.
 */
const nodeVersionFile = new TextFile(project, ".node-version", {
  lines: [
    NODE_VERSION,
  ],
});

/**
 * Base TypeScript config for editors, tests and the projen code.
 */
const tsconfig = new javascript.TypescriptConfig(project, {
  fileName: "tsconfig.json",
  include: [
    ".projenrc.ts",
    "projenrc/**/*.ts",
    "data/**/*.ts",
  ],
  compilerOptions: {
    target: "ESNext",
    module: "NodeNext",
    moduleResolution: javascript.TypeScriptModuleResolution.NODE_NEXT,
    strict: true,
    noEmit: true,
    allowImportingTsExtensions: true,
    erasableSyntaxOnly: true,
    verbatimModuleSyntax: true,
    noUncheckedIndexedAccess: true,
    skipLibCheck: true,
    types: [
      "node",
    ],
  },
});

/**
 * TypeScript config that the projen type check uses.
 */
const PROJENRC_TSCONFIG_FILE = "tsconfig.projen.json";

const projenrc = new typescript.ProjenrcTs(project, {
  runner: typescript.TypeScriptRunner.nodejs({
    typeCheck: true,
    tsconfig: PROJENRC_TSCONFIG_FILE,
  }),
});

projenrc.tsconfig.addExtends(tsconfig);

project.testTask.exec("vitest run");

/**
 * Folder with one subfolder for each category, and one file for each entry, relative to the
 * project root.
 */
const ENTRIES_PATH = "data/entries";

/**
 * Absolute path of the entries folder.
 */
const ENTRIES_DIR = join(import.meta.dirname, ENTRIES_PATH);

/**
 * Path of the contribution guidelines.
 */
const CONTRIBUTING_FILE = "contributing.md";

/**
 * The list that `readme.md` shows.
 */
const list = new AwesomeList(project, {
  title: "Awesome Amazon Seller",
  description: "A curated list of tools and resources for Amazon sellers.",
  contributingFile: CONTRIBUTING_FILE,
});

/**
 * The loaded entries, grouped by the ID of their category folder.
 */
const entriesByCategory = Map.groupBy(await loadEntries(ENTRIES_DIR), (entry) => entry.categoryId);

for (const categoryOptions of CATEGORIES) {
  const category = new Category(list, categoryOptions);
  list.addCategory(category);

  for (const { options } of entriesByCategory.get(category.id) ?? []) {
    category.addEntry(new Entry(category, options));
  }

  entriesByCategory.delete(category.id);
}

if (entriesByCategory.size > 0) {
  throw new Error(`Unknown category folders in ${ENTRIES_DIR}: ${[
    ...entriesByCategory.keys(),
  ].join(", ")}`);
}

new ListValidator(list, {
  rules: DEFAULT_RULES,
  findingsFile: process.env.AWESOME_FINDINGS_FILE,
});

project.testTask.exec(`awesome-lint ${list.readme.path}`);

/**
 * The GitHub settings of the project. Each workflow is its own component.
 */
const gitHub = new github.GitHub(project, {
  mergify: false,
  pullRequestLint: false,
});

pinActions(gitHub);

new build.BuildWorkflow(project, {
  buildTask: project.buildTask,
  runsOn: RUNS_ON,
  preBuildSteps: installSteps({
    nodeVersionFile,
  }),
  mutableBuild: false,
  permissions: {
    contents: github.workflows.JobPermission.READ,
  },
  workflowTriggers: {
    pullRequest: {},
    push: {
      branches: [
        DEFAULT_BRANCH,
      ],
    },
    workflowDispatch: {},
  },
});

new PrLinksWorkflow(gitHub, {
  entriesPath: ENTRIES_PATH,
});

new ContributionTemplates(gitHub, {
  list,
  repositoryUrl: REPOSITORY_URL,
  defaultBranch: DEFAULT_BRANCH,
});

project.synth();
