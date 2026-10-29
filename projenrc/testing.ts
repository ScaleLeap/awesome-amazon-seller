import { Project } from "projen";
import { AwesomeList } from "./awesome-list.ts";
import type { ICategory } from "./category.ts";
import type { EntryOptions } from "./entry.ts";

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
 * Makes a test list with one "tools" category, and gives that category.
 */
export function createCategory(): ICategory {
  return createList().addCategory({
    id: "tools",
    title: "Tools",
  });
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
