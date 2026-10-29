import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isEntryOptions, loadEntries } from "./load-entries.ts";

/**
 * Writes one entry file in a new entries folder, and gives the path of that folder.
 */
function writeEntriesDir(categoryId: string, fileName: string, content: string): string {
  const entriesDir = mkdtempSync(join(tmpdir(), "entries-"));
  mkdirSync(join(entriesDir, categoryId));
  writeFileSync(join(entriesDir, categoryId, fileName), content);

  return entriesDir;
}

/**
 * Content of a valid entry file for "Acme Seller Tool".
 */
const ACME_SELLER_TOOL_FILE = `export const entry = {
  name: "Acme Seller Tool",
  url: "https://www.acme.example.com/",
  description: "Product research.",
};
`;

describe(loadEntries, () => {
  it("gives the category from the folder and the options from the file", async () => {
    expect.assertions(1);

    // Arrange
    const entriesDir = writeEntriesDir("tools", "acme-seller-tool.ts", ACME_SELLER_TOOL_FILE);

    // Act
    const entries = await loadEntries(entriesDir);

    // Assert
    expect(entries).toStrictEqual([
      {
        categoryId: "tools",
        options: {
          name: "Acme Seller Tool",
          url: "https://www.acme.example.com/",
          description: "Product research.",
        },
        file: join(entriesDir, "tools", "acme-seller-tool.ts"),
      },
    ]);
  });

  it("throws when the file name is not the slug of the entry name", async () => {
    expect.assertions(1);

    // Arrange
    const entriesDir = writeEntriesDir("tools", "acme.ts", ACME_SELLER_TOOL_FILE);

    // Act
    const act = loadEntries(entriesDir);

    // Assert
    await expect(act).rejects.toThrow("rename the file to \"acme-seller-tool.ts\"");
  });

  it("throws when the file does not export an entry", async () => {
    expect.assertions(1);

    // Arrange
    const entriesDir = writeEntriesDir("tools", "empty.ts", "export const other = 1;\n");

    // Act
    const act = loadEntries(entriesDir);

    // Assert
    await expect(act).rejects.toThrow("must export \"entry\"");
  });
});

describe(isEntryOptions, () => {
  it("rejects links that have no label", () => {
    expect.assertions(1);

    // Arrange
    const value = {
      name: "Acme Seller Tool",
      url: "https://www.acme.example.com/",
      description: "Product research.",
      links: [
        {
          url: "https://github.com/",
        },
      ],
    };

    // Act
    const result = isEntryOptions(value);

    // Assert
    expect(result).toBe(false);
  });
});
