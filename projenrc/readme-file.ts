import type { IConstruct } from "constructs";
import { FileBase } from "projen";
import type { IAwesomeList } from "./awesome-list.ts";
import type { IEntry } from "./entry.ts";

/**
 * Path of the readme file, relative to the project root.
 */
const README_PATH = "readme.md";

/**
 * Badge that every awesome list shows next to its title.
 *
 * @see https://github.com/sindresorhus/awesome/blob/main/awesome.md#add-the-awesome-badge
 */
const AWESOME_BADGE = "[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)";

/**
 * Heading of the section that tells people how to contribute.
 */
const CONTRIBUTE_TITLE = "Contribute";

/**
 * Horizontal rule between the parts of the readme.
 */
const SEPARATOR = "---";

/**
 * Characters that GitHub removes when it makes an anchor from a heading.
 */
const NON_ANCHOR_CHARACTERS = /[^\p{L}\p{N}\s-]/gu;

/**
 * Makes the anchor that GitHub gives to a heading, for example "Software and Tools" becomes
 * "software-and-tools".
 */
export function githubAnchor(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(NON_ANCHOR_CHARACTERS, "")
    .replace(/\s/g, "-");
}

/**
 * Sorts entries by name, with no difference between upper case and lower case.
 */
export function sortEntries(entries: readonly IEntry[]): IEntry[] {
  return [...entries].sort((a, b) => a.name.localeCompare(b.name, "en", {
    sensitivity: "base",
  }));
}

/**
 * Makes the Markdown list item of an entry.
 */
export function renderEntry(entry: IEntry): string {
  const links = entry.links.map((link) => ` [${link.label}](${link.url})`).join("");

  return `- [${entry.name}](${entry.url}) - ${entry.description}${links}`;
}

/**
 * The `readme.md` of an awesome list. It reads the list at synth time, so it always shows all
 * categories and entries.
 */
export class ReadmeFile extends FileBase {
  /**
   * The list that this file shows.
   */
  private readonly list: IAwesomeList;

  /**
   * Creates the readme file of a list.
   */
  constructor(list: IAwesomeList & IConstruct) {
    super(list, README_PATH);

    this.list = list;
  }

  /**
   * Makes the Markdown content of the readme.
   */
  protected synthesizeContent(): string {
    const categories = this.list.categories.filter((category) => category.entries.length > 0);
    const headings = [
      ...categories.map((category) => category.title),
      CONTRIBUTE_TITLE,
    ];

    const sections = categories.map((category) => [
      `## ${category.title}`,
      "",
      ...sortEntries(category.entries).map(renderEntry),
      "",
    ]);

    return [
      `# ${this.list.title} ${AWESOME_BADGE}`,
      "",
      `> ${this.list.description}`,
      "",
      "## Contents",
      "",
      ...headings.map((heading) => `- [${heading}](#${githubAnchor(heading)})`),
      "",
      SEPARATOR,
      "",
      ...sections.flat(),
      SEPARATOR,
      "",
      `## ${CONTRIBUTE_TITLE}`,
      "",
      "Contributions welcome!",
      "",
      `Read the [contribution guidelines](${this.list.contributingFile}) first.`,
      "",
      ...(this.marker
        ? [
          `<!-- ${this.marker} -->`,
          "",
        ]
        : []),
    ].join("\n");
  }
}
