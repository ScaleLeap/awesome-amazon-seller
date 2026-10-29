import { describe, expect, it } from "vitest";
import { addEntry, createCategory } from "../testing.ts";
import { linkHealthRule } from "./link-health.ts";

/**
 * Number of days in the grace period of the tests.
 */
const GRACE_DAYS = 7;

/**
 * A URL that failed the weekly link check.
 */
const DEAD = "https://dead.example.com/";

describe(linkHealthRule, () => {
  it("warns about an entry with a failed link", () => {
    expect.assertions(1);

    // Arrange
    const { list, category } = createCategory();
    addEntry(category, {
      url: DEAD,
    });
    const rule = linkHealthRule({
      health: {
        [DEAD]: "2026-11-02",
      },
      graceDays: GRACE_DAYS,
    });

    // Act
    const findings = rule.check(list);

    // Assert
    expect(findings).toStrictEqual([
      {
        rule: "link-health",
        level: "warning",
        entry: "tools/acme-seller-tool",
        message: `A link failed the weekly link check: ${DEAD} (since 2026-11-02). If the main URL fails for ${GRACE_DAYS} days, the weekly job removes the entry.`,
      },
    ]);
  });

  it("gives no finding for an entry with working links", () => {
    expect.assertions(1);

    // Arrange
    const { list, category } = createCategory();
    addEntry(category);
    const rule = linkHealthRule({
      health: {
        [DEAD]: "2026-11-02",
      },
      graceDays: GRACE_DAYS,
    });

    // Act
    const findings = rule.check(list);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
