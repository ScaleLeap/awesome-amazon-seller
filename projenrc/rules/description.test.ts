import { describe, expect, it } from "vitest";
import { createCategory, entryOptions } from "../testing.ts";
import {
  descriptionLengthRule,
  descriptionLinksRule,
  descriptionPunctuationRule,
  descriptionRepeatsNameRule,
  MAX_DESCRIPTION_LENGTH,
} from "./description.ts";
import type { IRule } from "./rule.ts";

/**
 * Runs a rule on a list with one entry, and gives the IDs of the rules that found problems.
 */
function check(rule: IRule, description: string): string[] {
  const { list, category } = createCategory();
  category.addEntry(entryOptions({
    description,
  }));

  return rule.check(list).map((finding) => finding.rule);
}

describe("description rules", () => {
  it.each([
    {
      rule: descriptionPunctuationRule,
      description: "Product research.",
    },
    {
      rule: descriptionPunctuationRule,
      description: "Is it awesome?",
    },
    {
      rule: descriptionRepeatsNameRule,
      description: "Product research tool.",
    },
    {
      rule: descriptionLengthRule,
      description: "a".repeat(MAX_DESCRIPTION_LENGTH),
    },
    {
      rule: descriptionLinksRule,
      description: "Product research.",
    },
  ])("$rule.id accepts \"$description\"", ({ rule, description }) => {
    expect.assertions(1);

    // Arrange
    const text = description;

    // Act
    const findings = check(rule, text);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      rule: descriptionPunctuationRule,
      description: "Product research",
    },
    {
      rule: descriptionRepeatsNameRule,
      description: "Acme Seller Tool is a product research tool.",
    },
    {
      rule: descriptionLengthRule,
      description: "a".repeat(MAX_DESCRIPTION_LENGTH + 1),
    },
    {
      rule: descriptionLinksRule,
      description: "See https://example.com for more.",
    },
    {
      rule: descriptionLinksRule,
      description: "Has an [open spec](https://example.com).",
    },
  ])("$rule.id rejects \"$description\"", ({ rule, description }) => {
    expect.assertions(1);

    // Arrange
    const text = description;

    // Act
    const findings = check(rule, text);

    // Assert
    expect(findings).toStrictEqual([
      rule.id,
    ]);
  });
});
