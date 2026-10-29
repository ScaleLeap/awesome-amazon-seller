# How to contribute a resource

This guide shows you how to add a resource to the list, or change a resource that is in it.

This project has a [Contributor Code of Conduct](code-of-conduct.md). When you take part in this project, you agree to obey its terms.

## What the list accepts

The list is for **awesome** resources for Amazon sellers. Read [the awesome manifesto](https://github.com/sindresorhus/awesome/blob/main/awesome.md) to learn what "awesome" means here.

Do:

- Add a resource only if it is awesome, not average.
- Write a short and factual description, with no marketing text.
- Tell us in the pull request if you work for the company that makes the resource.

Do not:

- Send spam.
- Add guru courses.
- Add affiliate links or tracking parameters, such as `?ref=` or `?utm_source=`.

If the resource does not fit a category, send it anyway. We can add a new category.

## Option 1: Open an issue

If you do not want to edit code, [suggest a resource](https://github.com/ScaleLeap/awesome-amazon-seller/issues/new?template=suggest-resource.yml) with the issue form. A maintainer adds it to the list.

## Option 2: Open a pull request

### Before you start

Install these tools:

- Node.js, at the version in [`.node-version`](.node-version)
- [pnpm](https://pnpm.io/installation) 12

Do not edit `readme.md`. A script makes it from the files in [`data/`](data/).

### The procedure

1. Fork the repository, then clone your fork.
2. Install the dependencies:

   ```sh
   pnpm install
   ```

3. Find the folder of the category in [`data/entries/`](data/entries/). [`data/categories.ts`](data/categories.ts) lists all categories.
4. Make a file in that folder. The file name is the resource name in lower case, with dashes for spaces. For "Acme Seller Tool", the file is `acme-seller-tool.ts`.
5. Write the entry in the file:

   ```ts
   import type { EntryOptions } from "../../../projenrc/entry.ts";

   /**
    * The "Acme Seller Tool" entry.
    */
   export const entry = {
     name: "Acme Seller Tool",
     url: "https://www.acme.example.com/",
     description: "Tracks the prices and sales ranks of products in one dashboard.",
   } satisfies EntryOptions;
   ```

6. If the resource has a second important link, such as a GitHub repository, add it in `links`:

   ```ts
   links: [
     {
       label: "GitHub",
       url: "https://github.com/example/example",
     },
   ],
   ```

7. Make the readme again:

   ```sh
   npx projen
   ```

8. Commit the entry file and `readme.md`.
9. Open a pull request. In the description, tell us why the resource is awesome.

To change a resource, edit its file in `data/entries/`, then do steps 7 to 9.

### How to make sure that the entry is correct

`npx projen` checks each entry before it makes the readme. If an entry has an error, the command stops and tells you the file and the fix.

These rules give an error:

- The description ends with `.`, `!` or `?`.
- The description does not start with the name of the resource.
- The description has no links. Put extra links in `links`.
- Each URL is a full, valid URL.
- No URL has affiliate or tracking parameters.
- No other entry has the same URL.
- The file name agrees with the name of the resource.

These rules give only a warning:

- The description has 300 characters or fewer.
- Each URL starts with `https://`.

To run all checks, the tests and the lint, the same as the CI does:

```sh
npx projen build
```

Note: awesome-lint reads the remote of the current branch. If the build says "Awesome list must reside in a valid git repository", push the branch with `git push -u origin HEAD`, then run the build again.

## What happens after you open the pull request

These checks run automatically on each pull request:

- **Build.** The build runs `npx projen build`. It fails if an entry has an error, or if `readme.md` does not agree with the entry files.
- **Links.** A link check opens each URL in the entry files that you added or changed. A site that blocks bots with a 403 response passes.
- **Report.** A bot posts one comment with the result of the entry checks, and updates it after each push. It also sets one of these labels: `ready` or `needs-changes`.

Each week, a job checks all links of the list. If the main URL of an entry fails two checks in a row, the job opens a pull request that removes the entry. A maintainer checks the site before the merge.

When a maintainer approves the pull request and the build passes, an AI review can add a second comment. This review only gives advice. A maintainer makes the decision.

## If a maintainer asks for changes

Edit the files on the branch of your pull request, run `npx projen`, then push. You do not have to open a new pull request.
