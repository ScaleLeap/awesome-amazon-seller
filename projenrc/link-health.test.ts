import { describe, expect, it } from "vitest";
import { deadUrlsFromLychee, updateLinkHealth, type LinkHealthUpdate } from "./link-health.ts";

/**
 * Number of days in the grace period of the tests.
 */
const GRACE_DAYS = 7;

/**
 * Date of the check in the tests.
 */
const TODAY = new Date("2026-11-09T06:00:00Z");

/**
 * A URL that works.
 */
const LIVE = "https://live.example.com/";

/**
 * A URL that fails.
 */
const DEAD = "https://dead.example.com/";

/**
 * Makes update input. Pass fields to change them.
 */
function update(overrides: Partial<LinkHealthUpdate> = {}): LinkHealthUpdate {
  return {
    health: {},
    checkedUrls: [
      LIVE,
      DEAD,
    ],
    deadUrls: new Set([
      DEAD,
    ]),
    today: TODAY,
    graceDays: GRACE_DAYS,
    ...overrides,
  };
}

describe(updateLinkHealth, () => {
  it("records the date of a new failure", () => {
    expect.assertions(1);

    // Arrange
    const input = update();

    // Act
    const result = updateLinkHealth(input);

    // Assert
    expect(result).toStrictEqual({
      health: {
        [DEAD]: "2026-11-09",
      },
      newlyDead: [
        DEAD,
      ],
      expired: [],
    });
  });

  it("keeps the first date and expires the URL after the grace period", () => {
    expect.assertions(2);

    // Arrange
    const input = update({
      health: {
        [DEAD]: "2026-11-02",
      },
    });

    // Act
    const result = updateLinkHealth(input);

    // Assert
    expect(result.health).toStrictEqual({
      [DEAD]: "2026-11-02",
    });
    expect(result.expired).toStrictEqual([
      DEAD,
    ]);
  });

  it("does not expire a URL inside the grace period", () => {
    expect.assertions(1);

    // Arrange
    const input = update({
      health: {
        [DEAD]: "2026-11-03",
      },
    });

    // Act
    const result = updateLinkHealth(input);

    // Assert
    expect(result.expired).toStrictEqual([]);
  });

  it("removes a URL that works again, or that is not in the list", () => {
    expect.assertions(1);

    // Arrange
    const input = update({
      health: {
        [LIVE]: "2026-11-02",
        "https://removed.example.com/": "2026-11-02",
      },
      deadUrls: new Set(),
    });

    // Act
    const result = updateLinkHealth(input);

    // Assert
    expect(result.health).toStrictEqual({});
  });
});

describe(deadUrlsFromLychee, () => {
  it("gives the URLs of errors and timeouts", () => {
    expect.assertions(1);

    // Arrange
    const report = {
      error_map: {
        "urls.txt": [
          {
            url: DEAD,
            status: {
              text: "404 Not Found",
              code: 404,
            },
          },
        ],
      },
      timeout_map: {
        "urls.txt": [
          {
            url: "https://slow.example.com/",
          },
        ],
      },
      success_map: {
        "urls.txt": [
          {
            url: LIVE,
          },
        ],
      },
    };

    // Act
    const urls = deadUrlsFromLychee(report);

    // Assert
    expect([
      ...urls,
    ]).toStrictEqual([
      DEAD,
      "https://slow.example.com/",
    ]);
  });
});
