import { join } from "node:path";
import { Project, TextFile, javascript, typescript } from "projen";
import { CATEGORIES } from "./data/categories.ts";
import { AwesomeList } from "./projenrc/awesome-list.ts";
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
 * The `package.json` of the project.
 */
const nodePackage = new javascript.NodePackage(project, {
  packageName: "awesome-amazon-seller",
  description: "A curated list of tools and resources for Amazon sellers.",
  license: "CC0-1.0",
  packageManager: javascript.NodePackageManager.PNPM,
  pnpmVersion: PNPM_VERSION,
  minNodeVersion: NODE_VERSION,
  repository: "https://github.com/ScaleLeap/awesome-amazon-seller.git",
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

new TextFile(project, ".node-version", {
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
 * Folder with one subfolder for each category, and one file for each entry.
 */
const ENTRIES_DIR = join(import.meta.dirname, "data", "entries");

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

for (const category of CATEGORIES) {
  list.addCategory(category);
}

for (const { categoryId, options } of await loadEntries(ENTRIES_DIR)) {
  list.category(categoryId).addEntry(options);
}

new ListValidator(list, {
  rules: DEFAULT_RULES,
  findingsFile: process.env.AWESOME_FINDINGS_FILE,
});

project.testTask.exec(`awesome-lint ${list.readme.path}`);

project.synth();
