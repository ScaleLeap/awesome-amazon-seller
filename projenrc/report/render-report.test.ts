import { describe, expect, it } from "vitest";
import type { Finding } from "../rules/rule.ts";
import { escapeCell, renderReport, type ReportInput } from "./render-report.ts";

/**
 * Address of a made-up build run.
 */
const RUN_URL = "https://github.com/example/list/actions/runs/1";

/**
 * A made-up commit SHA.
 */
const HEAD_SHA = "0123456789abcdef0123456789abcdef01234567";

/**
 * An error finding.
 */
const ERROR: Finding = {
  rule: "description-punctuation",
  level: "error",
  entry: "tools/acme-seller-tool",
  message: "End the description with \".\", \"!\" or \"?\".",
};

/**
 * A warning finding.
 */
const WARNING: Finding = {
  rule: "https",
  level: "warning",
  entry: "tools/beta-analytics",
  message: "Use an \"https://\" URL, if the site supports it.",
};

/**
 * Makes report input. Pass fields to change them.
 */
function input(overrides: Partial<ReportInput> = {}): ReportInput {
  return {
    findings: [],
    conclusion: "success",
    runUrl: RUN_URL,
    headSha: HEAD_SHA,
    ...overrides,
  };
}

describe(renderReport, () => {
  it.each([
    {
      name: "a passed build with no findings",
      overrides: {},
      status: "ready",
    },
    {
      name: "a passed build with warnings",
      overrides: {
        findings: [
          WARNING,
        ],
      },
      status: "ready",
    },
    {
      name: "errors",
      overrides: {
        findings: [
          ERROR,
        ],
        conclusion: "failure",
      },
      status: "needs-changes",
    },
    {
      name: "a failed build with no findings file",
      overrides: {
        findings: undefined,
        conclusion: "failure",
      },
      status: "needs-changes",
    },
  ] as const)("gives the status \"$status\" for $name", ({ overrides, status }) => {
    expect.assertions(1);

    // Arrange
    const reportInput = input(overrides);

    // Act
    const report = renderReport(reportInput);

    // Assert
    expect(report.status).toBe(status);
  });

  it("lists the errors before the warnings", () => {
    expect.assertions(1);

    // Arrange
    const reportInput = input({
      findings: [
        WARNING,
        ERROR,
      ],
      conclusion: "failure",
    });

    // Act
    const report = renderReport(reportInput);

    // Assert
    expect(report.markdown).toMatchSnapshot();
  });

  it("shows only the findings of the changed entries, and the errors of other entries", () => {
    expect.assertions(4);

    // Arrange
    const otherError: Finding = {
      ...ERROR,
      entry: "tools/other-tool",
    };
    const reportInput = input({
      findings: [
        WARNING,
        otherError,
      ],
      conclusion: "failure",
      changedEntries: new Set([
        "tools/acme-seller-tool",
      ]),
    });

    // Act
    const report = renderReport(reportInput);

    // Assert
    expect(report.markdown).not.toContain("tools/beta-analytics");
    expect(report.markdown).toContain("### Errors in other entries");
    expect(report.markdown).toContain("tools/other-tool");
    expect(report.markdown).toContain("The entries of this pull request have no errors.");
  });

  it("gives a clean report when only other entries have warnings", () => {
    expect.assertions(2);

    // Arrange
    const reportInput = input({
      findings: [
        WARNING,
      ],
      changedEntries: new Set([
        "tools/acme-seller-tool",
      ]),
    });

    // Act
    const report = renderReport(reportInput);

    // Assert
    expect(report.markdown).toContain("The build passed, and the entry checks found no problems.");
    expect(report.status).toBe("ready");
  });

  it("tells the contributor to run projen when the build failed with no errors", () => {
    expect.assertions(2);

    // Arrange
    const reportInput = input({
      conclusion: "failure",
    });

    // Act
    const report = renderReport(reportInput);

    // Assert
    expect(report.markdown).toContain("Run `npx projen`, commit all changed files, then push again.");
    expect(report.markdown).toContain(RUN_URL);
  });
});

describe(escapeCell, () => {
  it("escapes Markdown, HTML and mentions from untrusted text", () => {
    expect.assertions(1);

    // Arrange
    const text = "Ping @maintainer | <img src=x>\n**bold**";

    // Act
    const escaped = escapeCell(text);

    // Assert
    expect(escaped).toBe("Ping @​maintainer \\| \\<img src=x\\> \\*\\*bold\\*\\*");
  });
});
