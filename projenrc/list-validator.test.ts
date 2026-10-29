import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Testing } from "projen";
import { describe, expect, it } from "vitest";
import { ListValidator } from "./list-validator.ts";
import { entryRule } from "./rules/index.ts";
import { addCategory, createList, entryOptions } from "./testing.ts";

/**
 * A rule that gives an error for each entry.
 */
const alwaysErrorRule = entryRule({
  id: "always-error",
  level: "error",
  test: () => false,
  message: () => "Always wrong.",
});

/**
 * A rule that gives a warning for each entry.
 */
const alwaysWarnRule = entryRule({
  id: "always-warn",
  level: "warning",
  test: () => false,
  message: () => "Always doubtful.",
});

/**
 * Makes a list with one entry.
 */
function createListWithEntry() {
  const list = createList();
  addCategory(list).addEntry(entryOptions());

  return list;
}

describe(ListValidator, () => {
  it("stops synth when a rule finds an error", () => {
    expect.assertions(1);

    // Arrange
    const list = createListWithEntry();
    new ListValidator(list, {
      rules: [
        alwaysErrorRule,
      ],
    });

    // Act
    const act = () => Testing.synth(list.project);

    // Assert
    expect(act).toThrow("The list has 1 error(s).");
  });

  it("lets synth continue when a rule finds only warnings", () => {
    expect.assertions(1);

    // Arrange
    const list = createListWithEntry();
    new ListValidator(list, {
      rules: [
        alwaysWarnRule,
      ],
    });

    // Act
    const files = Testing.synth(list.project);

    // Assert
    expect(files["readme.md"]).toContain("Acme Seller Tool");
  });

  it("writes all findings to the findings file", () => {
    expect.assertions(1);

    // Arrange
    const findingsFile = join(mkdtempSync(join(tmpdir(), "findings-")), "findings.json");
    const list = createListWithEntry();
    new ListValidator(list, {
      rules: [
        alwaysWarnRule,
      ],
      findingsFile,
    });

    // Act
    Testing.synth(list.project);

    // Assert
    expect(JSON.parse(readFileSync(findingsFile, "utf8"))).toStrictEqual([
      {
        rule: "always-warn",
        level: "warning",
        entry: "tools/acme-seller-tool",
        message: "Always doubtful.",
      },
    ]);
  });
});
