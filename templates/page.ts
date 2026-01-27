import { readTextFile } from '../build.utilities.ts';
import { ldJsonify } from '../schemas/microdata.ts';
import { escapeHtml, html } from '../utilities/html.ts';
import { asCanonicalUrl } from '../utilities/urls.ts';

const footer = await readTextFile('./templates/footer.html');

export interface PageMeta {
	title: string;
	slug: string;
	description: string;
	/** HTML content for the page, which will go inside a <main> element before the site header and footer. */
	content: string;
	ldjsons?: any[];
	social?: {
		title?: string;
		description?: string;
		image?: string;
	};
	canonical?: string | null;
}

export async function populateHtmlTemplate(meta: PageMeta): Promise<string> {
	meta = { ...meta };
	const canonical = asCanonicalUrl(meta.canonical || meta.slug);
	if (meta.social?.image && !meta.social.image.startsWith('https://')) {
		meta.social.image = asCanonicalUrl(meta.social.image);
	}
	const ldjson = ldJsonify(meta.ldjsons || []);
	const page = html`
		<!doctype html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<meta name="robots" content="index, follow" />
				<!-- Feeds -->
				<link rel="alternate" type="application/rss+xml" href="/feed.rss" />
				<link rel="alternate" type="application/atom+xml" href="./feed.atom" />
				<link rel="alternate" type="application/feed+json" href="./feed.json" />
				<!-- Page Details -->
				<title>${escapeHtml(meta.title)}</title>
				<meta
					property="og:title"
					content="${escapeHtml(meta.social?.title || meta.title)}"
				/>
				<meta name="description" content="${escapeHtml(meta.description)}" />
				<meta
					property="og:description"
					content="${escapeHtml(meta.social?.description || meta.description)}"
				/>
				${meta.social?.image
					? html`<meta
							property="og:image"
							content="${escapeHtml(meta.social.image)}"
						/>`
					: ''}
				<meta property="og:url" content="${escapeHtml(canonical)}" />
				<link rel="canonical" href="${escapeHtml(canonical)}" />
				${ldjson}
			</head>
			<body>
				<header>
					<!-- TODO: NAVIGATION -->
				</header>
				<main>${meta.content}</main>
				${footer}
			</body>
		</html>
	`;
	return page;
	// return await formatHtml(page);
}
