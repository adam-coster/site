import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { articleMetadataSchema } from "./schemas/articles.ts";

const articles = defineCollection({
  loader: glob({ pattern: "*.md", base: "./articles" }),
  schema: articleMetadataSchema,
});

const profiles = defineCollection({
  loader: glob({ pattern: "*.{md,html}", base: "./profiles" }),
  schema: z.object({
    title: z.string(),
    sortKey: z.string(),
  }),
});

export const collections = { articles, profiles };
