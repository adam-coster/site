import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import lunr from 'lunr';

interface StoreEntry {
	url: string;
	title: string;
	description: string;
	tags: string[];
	publishedAt: string | undefined;
}

export const GET: APIRoute = async () => {
	const articles = await getCollection('articles');

	const store: Record<string, StoreEntry> = {};

	const index = lunr(function () {
		this.ref('id');
		this.field('title', { boost: 10 });
		this.field('description', { boost: 5 });
		this.field('tags', { boost: 3 });
		this.field('body');

		for (const article of articles) {
			store[article.id] = {
				url: `/articles/${article.id}`,
				title: article.data.title,
				description: article.data.description,
				tags: article.data.tags,
				publishedAt: article.data.publishedAt?.toISOString(),
			};
			this.add({
				id: article.id,
				title: article.data.title,
				description: article.data.description,
				tags: article.data.tags.join(' '),
				body: article.body ?? '',
			});
		}
	});

	return new Response(JSON.stringify({ index, store }), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
};
