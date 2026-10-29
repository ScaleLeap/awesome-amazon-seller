import { Component, YamlFile, github } from "projen";
import type { IAwesomeList } from "../awesome-list.ts";

/**
 * Path of the issue form that suggests a resource.
 */
const SUGGEST_RESOURCE_FORM = ".github/ISSUE_TEMPLATE/suggest-resource.yml";

/**
 * Path of the configuration of the issue template chooser.
 */
const ISSUE_TEMPLATE_CONFIG = ".github/ISSUE_TEMPLATE/config.yml";

/**
 * Answers to the question about the relation of the submitter to the resource.
 */
const RELATION_OPTIONS = [
  "I do not work for the company that makes this resource.",
  "I work for, or own, the company that makes this resource.",
];

/**
 * Options for the contribution templates.
 */
export interface ContributionTemplatesOptions {
  /**
   * The list that contributors add entries to. The category dropdown of the issue form shows
   * its categories.
   */
  readonly list: IAwesomeList;

  /**
   * Web address of the GitHub repository, for example "https://github.com/owner/repo".
   */
  readonly repositoryUrl: string;

  /**
   * Branch that pull requests merge into.
   */
  readonly defaultBranch: string;

  /**
   * Folder of the entry files, relative to the repository root, for example "data/entries".
   */
  readonly entriesPath: string;
}

/**
 * The pull request template and the issue forms that guide contributors.
 */
export class ContributionTemplates extends Component {
  /**
   * Creates the templates.
   */
  constructor(gitHub: github.GitHub, options: ContributionTemplatesOptions) {
    super(gitHub.project, "ContributionTemplates");

    const { list, repositoryUrl, defaultBranch, entriesPath } = options;

    /**
     * Full address of the contribution guidelines. A pull request template needs a full address,
     * because GitHub does not resolve relative links in it.
     */
    const contributingUrl = `${repositoryUrl}/blob/${defaultBranch}/${list.contributingFile}`;

    new github.PullRequestTemplate(gitHub, {
      lines: [
        "<!-- Tell us why the resource is awesome, and if you work for the company that makes it. -->",
        "",
        `- [ ] I read the [contribution guidelines](${contributingUrl}).`,
        `- [ ] I added or changed only files in \`${entriesPath}/\`, and I ran \`npx projen\`.`,
        "- [ ] The description is short and factual, with no marketing text.",
        "- [ ] The URL has no affiliate or tracking parameters.",
      ],
    });

    new YamlFile(gitHub.project, ISSUE_TEMPLATE_CONFIG, {
      obj: {
        blank_issues_enabled: false,
      },
    });

    new YamlFile(gitHub.project, SUGGEST_RESOURCE_FORM, {
      obj: {
        name: "Suggest a resource",
        description: "Suggest a tool or resource for the list.",
        title: "Add <resource name>",
        labels: [
          "suggestion",
        ],
        body: [
          {
            type: "input",
            id: "name",
            attributes: {
              label: "Name",
              description: "Name of the resource.",
            },
            validations: {
              required: true,
            },
          },
          {
            type: "input",
            id: "url",
            attributes: {
              label: "URL",
              description: "Main URL, with no affiliate or tracking parameters.",
              placeholder: "https://",
            },
            validations: {
              required: true,
            },
          },
          {
            type: "dropdown",
            id: "category",
            attributes: {
              label: "Category",
              options: () => list.categories.map((category) => category.title),
            },
            validations: {
              required: true,
            },
          },
          {
            type: "textarea",
            id: "description",
            attributes: {
              label: "Description",
              description: "One or two factual sentences, with no marketing text. End with a period.",
            },
            validations: {
              required: true,
            },
          },
          {
            type: "textarea",
            id: "why",
            attributes: {
              label: "Why is it awesome?",
            },
            validations: {
              required: true,
            },
          },
          {
            type: "dropdown",
            id: "relation",
            attributes: {
              label: "Your relation to the resource",
              options: RELATION_OPTIONS,
            },
            validations: {
              required: true,
            },
          },
        ],
      },
    });
  }
}
