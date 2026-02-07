import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { articleMetadataSchema } from '../schemas/content.metadata.ts';

const blog = defineCollection({
	loader: glob({ pattern: '*.md', base: './articles' }),
	schema: articleMetadataSchema,
});

export const collections = { blog };
