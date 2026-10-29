import { entryRule } from "./rule.ts";

/**
 * Characters that can end a description.
 */
const END_PUNCTUATION = /[.!?]$/;

/**
 * Text that shows a link or an address in a description.
 */
const LINK_PATTERN = /https?:\/\/|www\.|\]\(/i;

/**
 * Maximum length of a description, in characters. A longer description is usually marketing
 * text.
 */
export const MAX_DESCRIPTION_LENGTH = 300;

/**
 * The description ends with ".", "!" or "?".
 */
export const descriptionPunctuationRule = entryRule({
  id: "description-punctuation",
  level: "error",
  test: (entry) => END_PUNCTUATION.test(entry.description),
  message: () => "End the description with \".\", \"!\" or \"?\".",
});

/**
 * The description does not start with the name of the entry, because the name shows just
 * before it.
 */
export const descriptionRepeatsNameRule = entryRule({
  id: "description-repeats-name",
  level: "error",
  test: (entry) => !entry.description.toLowerCase().startsWith(entry.name.toLowerCase()),
  message: (entry) => `Do not start the description with the name "${entry.name}".`,
});

/**
 * The description is short.
 */
export const descriptionLengthRule = entryRule({
  id: "description-length",
  level: "warning",
  test: (entry) => entry.description.length <= MAX_DESCRIPTION_LENGTH,
  message: (entry) => `Make the description shorter: it has ${entry.description.length} characters, and the limit is ${MAX_DESCRIPTION_LENGTH}.`,
});

/**
 * The description has no links. Extra links go in the `links` option.
 */
export const descriptionLinksRule = entryRule({
  id: "description-links",
  level: "error",
  test: (entry) => !LINK_PATTERN.test(entry.description),
  message: () => "Remove the link from the description. Put extra links in \"links\".",
});
