import { describe, expect, it } from "vitest";
import { isTriageResult, renderTriage, type TriageResult } from "./render-triage.ts";

/**
 * A made-up commit SHA.
 */
const HEAD_SHA = "0123456789abcdef0123456789abcdef01234567";

/**
 * A valid triage result.
 */
const RESULT: TriageResult = {
  summary: "One new entry. It is a seller tool with a factual description.",
  entries: [
    {
      file: "data/entries/software-and-tools/acme-seller-tool.ts",
      verdict: "accept",
      notes: "Fits the category. No tracking parameters.",
    },
  ],
};

describe(isTriageResult, () => {
  it.each([
    {
      name: "a valid result",
      value: RESULT,
      expected: true,
    },
    {
      name: "an unknown verdict",
      value: {
        ...RESULT,
        entries: [
          {
            file: "a.ts",
            verdict: "merge",
            notes: "",
          },
        ],
      },
      expected: false,
    },
    {
      name: "null",
      value: null,
      expected: false,
    },
  ])("gives $expected for $name", ({ value, expected }) => {
    expect.assertions(1);

    // Arrange
    const input: unknown = value;

    // Act
    const valid = isTriageResult(input);

    // Assert
    expect(valid).toBe(expected);
  });
});

describe(renderTriage, () => {
  it("renders the summary and a table of verdicts", () => {
    expect.assertions(1);

    // Arrange
    const result = RESULT;

    // Act
    const markdown = renderTriage(result, HEAD_SHA);

    // Assert
    expect(markdown).toMatchSnapshot();
  });

  it("escapes mentions in text from the review", () => {
    expect.assertions(1);

    // Arrange
    const result: TriageResult = {
      summary: "Ask @everyone to approve.",
      entries: [],
    };

    // Act
    const markdown = renderTriage(result, HEAD_SHA);

    // Assert
    expect(markdown).not.toContain("@everyone");
  });
});
