import { Component } from "projen";
import type { IConstruct } from "constructs";
import { Entry, type EntryOptions, type IEntry } from "./entry.ts";

/**
 * Options for a category of the list.
 */
export interface CategoryOptions {
  /**
   * Stable ID of the category, for example "software-and-tools". Entries refer to it.
   */
  readonly id: string;

  /**
   * Heading of the category in the readme.
   */
  readonly title: string;
}

/**
 * A section of the list that holds the entries of one kind of resource.
 */
export interface ICategory {
  /**
   * Stable ID of the category.
   */
  readonly id: string;

  /**
   * Heading of the category in the readme.
   */
  readonly title: string;

  /**
   * The entries of this category, in the order they were added.
   */
  readonly entries: IEntry[];

  /**
   * Adds an entry to this category.
   */
  addEntry(options: EntryOptions): IEntry;
}

/**
 * A section of the list. It holds the entries of one kind of resource.
 */
export class Category extends Component implements ICategory {
  /**
   * Stable ID of the category.
   */
  public readonly id: string;

  /**
   * Heading of the category in the readme.
   */
  public readonly title: string;

  /**
   * Creates a category. Add it to a list with `IAwesomeList.addCategory()`.
   */
  constructor(scope: IConstruct, options: CategoryOptions) {
    super(scope, options.id);

    this.id = options.id;
    this.title = options.title;
  }

  /**
   * Adds an entry to this category.
   */
  public addEntry(options: EntryOptions): IEntry {
    return new Entry(this, options);
  }

  /**
   * The entries of this category, in the order they were added.
   */
  public get entries(): IEntry[] {
    return this.node.children.filter((child): child is Entry => child instanceof Entry);
  }
}
