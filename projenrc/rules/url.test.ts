import { describe, expect, it } from "vitest";
import { createCategory, entryOptions } from "../testing.ts";
import type { IRule } from "./rule.ts";
import { duplicateUrlRule, httpsRule, normalizeUrl, trackingParametersRule, validUrlRule } from "./url.ts";

/**
 * Runs a rule on a list with one entry, and gives the IDs of the rules that found problems.
 */
function check(rule: IRule, url: string): string[] {
  const { list, category } = createCategory();
  category.addEntry(entryOptions({
    url,
  }));

  return rule.check(list).map((finding) => finding.rule);
}

describe("URL rules", () => {
  it.each([
    {
      rule: validUrlRule,
      url: "https://example.com",
    },
    {
      rule: httpsRule,
      url: "https://example.com",
    },
    {
      rule: trackingParametersRule,
      url: "https://example.com/?page=2",
    },
  ])("$rule.id accepts $url", ({ rule, url }) => {
    expect.assertions(1);

    // Arrange
    const address = url;

    // Act
    const findings = check(rule, address);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      rule: validUrlRule,
      url: "example.com",
    },
    {
      rule: httpsRule,
      url: "http://example.com",
    },
    {
      rule: trackingParametersRule,
      url: "https://example.com/?ref=seller",
    },
    {
      rule: trackingParametersRule,
      url: "https://example.com/?utm_source=github",
    },
  ])("$rule.id rejects $url", ({ rule, url }) => {
    expect.assertions(1);

    // Arrange
    const address = url;

    // Act
    const findings = check(rule, address);

    // Assert
    expect(findings).toStrictEqual([
      rule.id,
    ]);
  });

  it("checks the extra links too", () => {
    expect.assertions(1);

    // Arrange
    const { list, category } = createCategory();
    category.addEntry(entryOptions({
      links: [
        {
          label: "GitHub",
          url: "https://github.com/example/?ref=list",
        },
      ],
    }));

    // Act
    const findings = trackingParametersRule.check(list);

    // Assert
    expect(findings).toHaveLength(1);
  });
});

describe(normalizeUrl, () => {
  it("ignores www, upper case in the host, a trailing slash and a hash", () => {
    expect.assertions(1);

    // Arrange
    const url = "https://WWW.Example.com/tools/#pricing";

    // Act
    const normalized = normalizeUrl(url);

    // Assert
    expect(normalized).toBe("example.com/tools");
  });
});

describe("duplicate-url", () => {
  it("finds the second entry with the same URL", () => {
    expect.assertions(1);

    // Arrange
    const { list, category } = createCategory();
    category.addEntry(entryOptions());
    category.addEntry(entryOptions({
      name: "Acme Seller Tool Copy",
      url: "https://acme.example.com",
    }));

    // Act
    const findings = duplicateUrlRule.check(list);

    // Assert
    expect(findings).toStrictEqual([
      {
        rule: "duplicate-url",
        level: "error",
        entry: "tools/acme-seller-tool-copy",
        message: "The URL is already in the list as \"tools/acme-seller-tool\".",
      },
    ]);
  });
});
