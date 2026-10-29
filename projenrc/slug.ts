/**
 * Combining marks that Unicode normalization separates from their base letters, such as the
 * accent in "é".
 */
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Runs of characters that cannot be in a slug.
 */
const NON_SLUG_CHARACTERS = /[^a-z0-9]+/g;

/**
 * Dashes at the start or the end of a slug.
 */
const EDGE_DASHES = /^-+|-+$/g;

/**
 * Makes a lowercase, dash-separated slug from a name, for example "Jungle Scout" becomes
 * "jungle-scout".
 */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(NON_SLUG_CHARACTERS, "-")
    .replace(EDGE_DASHES, "");
}
