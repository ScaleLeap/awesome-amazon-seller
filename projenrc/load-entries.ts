import { readdirSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import type { EntryLink, EntryOptions } from "./entry.ts";
import { isRecord } from "./guards.ts";
import { slugify } from "./slug.ts";

/**
 * Extension of an entry file.
 */
const ENTRY_FILE_EXTENSION = ".ts";

/**
 * Extension of a test file. The loader skips these files.
 */
const TEST_FILE_EXTENSION = ".test.ts";

/**
 * An entry that the loader read from its file.
 */
export interface LoadedEntry {
  /**
   * ID of the category, from the name of the folder that holds the file.
   */
  readonly categoryId: string;

  /**
   * The options that the file exports.
   */
  readonly options: EntryOptions;

  /**
   * Absolute path of the entry file.
   */
  readonly file: string;
}

/**
 * Tells if a value is an extra link of an entry.
 */
function isEntryLink(value: unknown): value is EntryLink {
  return isRecord(value)
    && typeof value.label === "string"
    && typeof value.url === "string";
}

/**
 * Tells if a value has the shape of entry options.
 */
export function isEntryOptions(value: unknown): value is EntryOptions {
  return isRecord(value)
    && typeof value.name === "string"
    && typeof value.url === "string"
    && typeof value.description === "string"
    && (value.links === undefined || (Array.isArray(value.links) && value.links.every(isEntryLink)));
}

/**
 * Reads one entry file and checks that its name agrees with the entry.
 *
 * @throws if the file does not export valid entry options, or if its name is not the slug of
 * the entry name
 */
async function loadEntryFile(file: string): Promise<EntryOptions> {
  const exported: unknown = await import(pathToFileURL(file).href);
  const displayPath = relative(process.cwd(), file);

  if (!isRecord(exported) || !isEntryOptions(exported.entry)) {
    throw new Error(`${displayPath} must export "entry" with "name", "url" and "description".`);
  }

  const expectedFile = `${slugify(exported.entry.name)}${ENTRY_FILE_EXTENSION}`;

  if (basename(file) !== expectedFile) {
    throw new Error(`${displayPath}: rename the file to "${expectedFile}", the slug of "${exported.entry.name}".`);
  }

  return exported.entry;
}

/**
 * Reads all entry files. Each subfolder of `entriesDir` is a category, and each file in it
 * is one entry.
 */
export async function loadEntries(entriesDir: string): Promise<LoadedEntry[]> {
  const categoryDirs = readdirSync(entriesDir, {
    withFileTypes: true,
  }).filter((dirent) => dirent.isDirectory());

  const entries = categoryDirs.flatMap((categoryDir) => {
    const dir = join(entriesDir, categoryDir.name);

    return readdirSync(dir)
      .filter((file) => file.endsWith(ENTRY_FILE_EXTENSION) && !file.endsWith(TEST_FILE_EXTENSION))
      .map(async (name) => {
        const file = join(dir, name);

        return {
          categoryId: categoryDir.name,
          options: await loadEntryFile(file),
          file,
        };
      });
  });

  return Promise.all(entries);
}
