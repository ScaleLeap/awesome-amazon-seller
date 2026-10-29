import type { CategoryOptions } from "../projenrc/category.ts";

/**
 * The categories of the list, in the order that the readme shows them.
 */
export const CATEGORIES = [
  {
    id: "software-and-tools",
    title: "Software and Tools",
  },
  {
    id: "product-research-and-pre-launch",
    title: "Product Research and Pre-Launch",
  },
  {
    id: "podcasts",
    title: "Podcasts",
  },
  {
    id: "blogs",
    title: "Blogs",
  },
  {
    id: "other",
    title: "Other",
  },
] as const satisfies readonly CategoryOptions[];
