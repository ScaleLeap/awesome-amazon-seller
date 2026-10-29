import { Component } from "projen";
import type { IConstruct } from "constructs";
import type { ICategory } from "./category.ts";
import { slugify } from "./slug.ts";

/**
 * An extra link that shows after the description of an entry, such as a GitHub repository.
 */
export interface EntryLink {
  /**
   * Text of the link.
   */
  readonly label: string;

  /**
   * Address of the link.
   */
  readonly url: string;
}

/**
 * Options for an entry of the list.
 */
export interface EntryOptions {
  /**
   * Name of the resource, as the list shows it.
   */
  readonly name: string;

  /**
   * Main address of the resource.
   */
  readonly url: string;

  /**
   * Short, factual description of the resource. It ends with punctuation.
   */
  readonly description: string;

  /**
   * Extra links that show after the description.
   *
   * @default - no extra links
   */
  readonly links?: readonly EntryLink[];
}

/**
 * A resource in a category of the list.
 */
export interface IEntry extends IConstruct {
  /**
   * The category that holds this entry.
   */
  readonly category: ICategory;

  /**
   * Name of the resource.
   */
  readonly name: string;

  /**
   * Main address of the resource.
   */
  readonly url: string;

  /**
   * Description of the resource.
   */
  readonly description: string;

  /**
   * Extra links that show after the description.
   */
  readonly links: readonly EntryLink[];

  /**
   * Slug of the name, for example "jungle-scout".
   */
  readonly slug: string;
}

/**
 * One resource in a category of the list.
 *
 * The construct ID is the slug of the name, so two entries with the same slug in one category
 * cause an error.
 */
export class Entry extends Component implements IEntry {
  /**
   * The category that holds this entry.
   */
  public readonly category: ICategory;

  /**
   * Name of the resource.
   */
  public readonly name: string;

  /**
   * Main address of the resource.
   */
  public readonly url: string;

  /**
   * Description of the resource.
   */
  public readonly description: string;

  /**
   * Extra links that show after the description.
   */
  public readonly links: readonly EntryLink[];

  /**
   * Slug of the name, for example "jungle-scout".
   */
  public readonly slug: string;

  /**
   * Creates an entry in a category. Use `ICategory.addEntry()` in place of this constructor.
   */
  constructor(category: ICategory, options: EntryOptions) {
    const slug = slugify(options.name);
    super(category, slug);

    this.category = category;
    this.slug = slug;
    this.name = options.name;
    this.url = options.url;
    this.description = options.description;
    this.links = options.links ?? [];
  }
}
