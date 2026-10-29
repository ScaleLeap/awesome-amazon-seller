import { Project } from "projen";
import { AwesomeList } from "./awesome-list.ts";
import { Category, type CategoryOptions } from "./category.ts";
import { Entry, type EntryOptions, type IEntry } from "./entry.ts";

/**
 * Makes an empty list in a new test project.
 */
export function createList(): AwesomeList {
  const project = new Project({
    name: "test",
  });

  return new AwesomeList(project, {
    title: "Awesome Test",
    description: "A list for tests.",
    contributingFile: "contributing.md",
  });
}

/**
 * Options of the "tools" category that the tests use.
 */
export const TOOLS_CATEGORY: CategoryOptions = {
  id: "tools",
  title: "Tools",
};

/**
 * Makes a category from options, and adds it to a list.
 */
export function addCategory(list: AwesomeList, options: CategoryOptions = TOOLS_CATEGORY): Category {
  const category = new Category(list, options);
  list.addCategory(category);

  return category;
}

/**
 * A test list and its one category.
 */
export interface ListWithCategory {
  /**
   * The test list.
   */
  readonly list: AwesomeList;

  /**
   * The "tools" category of the list.
   */
  readonly category: Category;
}

/**
 * Makes a test list with one "tools" category.
 */
export function createCategory(): ListWithCategory {
  const list = createList();

  return {
    list,
    category: addCategory(list),
  };
}

/**
 * Makes valid entry options. Pass fields to change them.
 */
export function entryOptions(overrides: Partial<EntryOptions> = {}): EntryOptions {
  return {
    name: "Acme Seller Tool",
    url: "https://www.acme.example.com/",
    description: "Product research.",
    ...overrides,
  };
}

/**
 * Makes an entry from valid options, and adds it to a category. Pass fields to change them.
 */
export function addEntry(category: Category, overrides: Partial<EntryOptions> = {}): IEntry {
  const entry = new Entry(category, entryOptions(overrides));
  category.addEntry(entry);

  return entry;
}
