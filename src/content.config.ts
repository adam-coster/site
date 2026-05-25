import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';
import { articleMetadataSchema } from './schemas/articles.ts';

const articles = defineCollection({
	loader: glob({ pattern: '*.md', base: './articles' }),
	schema: articleMetadataSchema,
});

const profiles = defineCollection({
	loader: glob({ pattern: '*.{md,html}', base: './profiles' }),
	schema: z.object({
		title: z.string(),
		sortKey: z.string(),
		tags: z.array(z.string()),
	}),
});

export const collections = { articles, profiles };
