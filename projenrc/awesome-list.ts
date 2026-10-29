import { Component, type Project } from "projen";
import type { IConstruct } from "constructs";
import { Category, type CategoryOptions, type ICategory } from "./category.ts";
import type { IEntry } from "./entry.ts";
import { ReadmeFile } from "./readme-file.ts";

/**
 * Options for an awesome list.
 */
export interface AwesomeListOptions {
  /**
   * Title of the list, for example "Awesome Amazon Seller".
   */
  readonly title: string;

  /**
   * One-sentence description of the list. It shows below the title.
   */
  readonly description: string;

  /**
   * Path of the contribution guidelines, relative to the readme.
   */
  readonly contributingFile: string;
}

/**
 * An awesome list: a set of categories, each with its entries.
 */
export interface IAwesomeList extends IConstruct {
  /**
   * Title of the list.
   */
  readonly title: string;

  /**
   * Description of the list.
   */
  readonly description: string;

  /**
   * Path of the contribution guidelines, relative to the readme.
   */
  readonly contributingFile: string;

  /**
   * The categories of the list, in the order they were added.
   */
  readonly categories: ICategory[];

  /**
   * All the entries of all the categories.
   */
  readonly entries: IEntry[];

  /**
   * Adds a category. The readme shows the categories in the order they were added.
   */
  addCategory(options: CategoryOptions): ICategory;

  /**
   * Finds a category by its ID.
   *
   * @throws if no category has that ID
   */
  category(id: string): ICategory;
}

/**
 * Construct ID of the list component in the project.
 */
const AWESOME_LIST_ID = "AwesomeList";

/**
 * An awesome list that renders to `readme.md`.
 */
export class AwesomeList extends Component implements IAwesomeList {
  /**
   * Title of the list.
   */
  public readonly title: string;

  /**
   * Description of the list.
   */
  public readonly description: string;

  /**
   * Path of the contribution guidelines, relative to the readme.
   */
  public readonly contributingFile: string;

  /**
   * Creates the list and its readme file.
   */
  constructor(project: Project, options: AwesomeListOptions) {
    super(project, AWESOME_LIST_ID);

    this.title = options.title;
    this.description = options.description;
    this.contributingFile = options.contributingFile;

    new ReadmeFile(this);
  }

  /**
   * Adds a category. The readme shows the categories in the order they were added.
   */
  public addCategory(options: CategoryOptions): ICategory {
    return new Category(this, options);
  }

  /**
   * Finds a category by its ID.
   *
   * @throws if no category has that ID
   */
  public category(id: string): ICategory {
    const category = this.categories.find((candidate) => candidate.id === id);

    if (!category) {
      throw new Error(`Unknown category "${id}"`);
    }

    return category;
  }

  /**
   * The categories of the list, in the order they were added.
   */
  public get categories(): ICategory[] {
    return this.node.children.filter((child): child is Category => child instanceof Category);
  }

  /**
   * All the entries of all the categories.
   */
  public get entries(): IEntry[] {
    return this.categories.flatMap((category) => category.entries);
  }
}
