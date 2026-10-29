import { Component } from "projen";
import type { IConstruct } from "constructs";
import type { IAwesomeList } from "./awesome-list.ts";
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
   * The list that holds this category.
   */
  readonly list: IAwesomeList;

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
   * The list that holds this category.
   */
  public readonly list: IAwesomeList;

  /**
   * Stable ID of the category.
   */
  public readonly id: string;

  /**
   * Heading of the category in the readme.
   */
  public readonly title: string;

  /**
   * Creates a category in a list. Use `IAwesomeList.addCategory()` in place of this constructor.
   */
  constructor(list: IAwesomeList & IConstruct, options: CategoryOptions) {
    super(list, options.id);

    this.list = list;
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
