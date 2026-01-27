import z from 'zod';

export type SiteContent = (ArticleMetadata & { path: string })[];

export type ArticleMetadata = z.infer<typeof articleMetadataSchema>;
export const articleMetadataSchema = z.object({
	kind: z.literal('article'),
	title: z.string().max(75).min(10),
	description: z.string().max(175).min(10),
	canonical: z.url().optional().nullable(),
	tags: z.array(z.string()),
	editedAt: z.iso.datetime().optional(),
	publishedAt: z.iso.datetime().optional(),
});
