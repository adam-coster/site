import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE_URL = 'https://adamcoster.com';

/** Pages with no associated date (static routes). */
const STATIC_PAGES: { url: string; lastmod?: undefined }[] = [
	{ url: `${SITE_URL}/` },
	{ url: `${SITE_URL}/about` },
] satisfies Array<{ url: string; lastmod?: string }>;

export const GET: APIRoute = async () => {
	const articles = await getCollection('articles');
	// When the tools collection is ready, uncomment and add to items below:
	// const tools = await getCollection("tools");

	const pages = [
		...STATIC_PAGES,
		...articles.map((a) => ({
			url: `${SITE_URL}/articles/${a.id}`,
			lastmod: (a.data.editedAt ?? a.data.publishedAt)
				?.toISOString()
				.slice(0, 10),
		})),
		// ...tools.map((t) => ({
		//   url: `${SITE_URL}/tools/${t.id}`,
		//   lastmod: (t.data.editedAt ?? t.data.publishedAt)
		//     ?.toISOString()
		//     .slice(0, 10),
		// })),
	];

	const urlElements = pages
		.map(({ url, lastmod }) =>
			lastmod ?
				`  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
			:	`  <url>\n    <loc>${url}</loc>\n  </url>`,
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
};
