import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { articleMetadataSchema } from '../schemas/content.metadata.ts';

const articles = defineCollection({
	loader: glob({ pattern: '*.md', base: './articles' }),
	schema: articleMetadataSchema,
});

export const collections = { articles };
