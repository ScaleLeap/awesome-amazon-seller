import { Testing } from "projen";
import { describe, expect, it } from "vitest";
import { AwesomeList } from "./awesome-list.ts";
import { Category } from "./category.ts";
import { Entry } from "./entry.ts";
import { TOOLS_CATEGORY, addCategory, addEntry, createList, entryOptions } from "./testing.ts";

describe(AwesomeList, () => {
  it("links an entry to its category in both directions", () => {
    expect.assertions(3);

    // Arrange
    const list = createList();
    const category = addCategory(list);

    // Act
    const entry = addEntry(category, {
      name: "Acme Seller Tool",
      url: "https://www.acme.example.com/",
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
    const category = addCategory(list);

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

  it("throws when two categories have the same ID", () => {
    expect.assertions(1);

    // Arrange
    const list = createList();
    addCategory(list);
    const copy = new Category(list.project, TOOLS_CATEGORY);

    // Act
    const act = () => list.addCategory(copy);

    // Assert
    expect(act).toThrow(`The list already has a category with the ID "${TOOLS_CATEGORY.id}"`);
  });

  it("throws when an entry is added to a category that is not its own", () => {
    expect.assertions(1);

    // Arrange
    const list = createList();
    const tools = addCategory(list);
    const blogs = addCategory(list, {
      id: "blogs",
      title: "Blogs",
    });
    const entry = new Entry(tools, entryOptions());

    // Act
    const act = () => blogs.addEntry(entry);

    // Assert
    expect(act).toThrow("The entry \"acme-seller-tool\" belongs to the category \"tools\", not \"blogs\"");
  });

  it("throws when two entries in a category have the same slug", () => {
    expect.assertions(1);

    // Arrange
    const category = addCategory(createList());
    addEntry(category, {
      name: "Acme Seller Tool",
      url: "https://www.acme.example.com/",
      description: "Product research.",
    });

    // Act
    const act = () => addEntry(category, {
      name: "acme seller tool",
      url: "https://example.com/",
      description: "A copy.",
    });

    // Assert
    expect(act).toThrow("acme-seller-tool");
  });

  it("renders the readme with sorted entries and a table of contents", () => {
    expect.assertions(1);

    // Arrange
    const list = createList();
    const tools = addCategory(list, {
      id: "tools",
      title: "Software and Tools",
    });
    addCategory(list, {
      id: "empty",
      title: "Empty",
    });
    addEntry(tools, {
      name: "zeta repricer",
      url: "https://zeta.example.com/",
      description: "Listing tools.",
    });
    addEntry(tools, {
      name: "Beta Analytics",
      url: "https://beta.example.com/",
      description: "Product search.",
      links: [
        {
          label: "GitHub",
          url: "https://github.com/example/beta-analytics",
        },
      ],
    });

    // Act
    const files = Testing.synth(list.project);

    // Assert
    expect(files["readme.md"]).toMatchSnapshot();
  });
});
