import { Project, Testing } from "projen";
import { describe, expect, it } from "vitest";
import { AwesomeList } from "./awesome-list.ts";

/**
 * Makes an empty list in a new test project.
 */
function createList(): AwesomeList {
  const project = new Project({
    name: "test",
  });

  return new AwesomeList(project, {
    title: "Awesome Test",
    description: "A list for tests.",
    contributingFile: "contributing.md",
  });
}

describe(AwesomeList, () => {
  it("links an entry to its category in both directions", () => {
    expect.assertions(3);

    // Arrange
    const list = createList();
    const category = list.addCategory({
      id: "tools",
      title: "Tools",
    });

    // Act
    const entry = category.addEntry({
      name: "Jungle Scout",
      url: "https://www.junglescout.com/",
      description: "Product research.",
    });

    // Assert
    expect(entry.category).toBe(category);
    expect(category.entries).toStrictEqual([
      entry,
    ]);
    expect(list.entries).toStrictEqual([
      entry,
    ]);
  });

  it("finds a category by its ID", () => {
    expect.assertions(1);

    // Arrange
    const list = createList();
    const category = list.addCategory({
      id: "tools",
      title: "Tools",
    });

    // Act
    const found = list.category("tools");

    // Assert
    expect(found).toBe(category);
  });

  it("throws for an unknown category ID", () => {
    expect.assertions(1);

    // Arrange
    const list = createList();

    // Act
    const act = () => list.category("missing");

    // Assert
    expect(act).toThrow("Unknown category \"missing\"");
  });

  it("throws when two entries in a category have the same slug", () => {
    expect.assertions(1);

    // Arrange
    const category = createList().addCategory({
      id: "tools",
      title: "Tools",
    });
    category.addEntry({
      name: "Jungle Scout",
      url: "https://www.junglescout.com/",
      description: "Product research.",
    });

    // Act
    const act = () => category.addEntry({
      name: "jungle scout",
      url: "https://example.com/",
      description: "A copy.",
    });

    // Assert
    expect(act).toThrow("jungle-scout");
  });

  it("renders the readme with sorted entries and a table of contents", () => {
    expect.assertions(1);

    // Arrange
    const list = createList();
    const tools = list.addCategory({
      id: "tools",
      title: "Software and Tools",
    });
    list.addCategory({
      id: "empty",
      title: "Empty",
    });
    tools.addEntry({
      name: "zonfy",
      url: "https://zonfy.app/",
      description: "Listing tools.",
    });
    tools.addEntry({
      name: "BuyWhere",
      url: "https://buywhere.ai/",
      description: "Product search.",
      links: [
        {
          label: "GitHub",
          url: "https://github.com/BuyWhere/buywhere-mcp",
        },
      ],
    });

    // Act
    const files = Testing.synth(list.project);

    // Assert
    expect(files["readme.md"]).toMatchSnapshot();
  });
});
