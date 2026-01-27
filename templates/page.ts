import { readTextFile } from '../build.utilities.ts';
import { escapeHtml, html } from '../utilities/html.ts';
import { asCanonicalUrl } from '../utilities/urls.ts';

const footer = await readTextFile('./templates/footer.html');

export function populateHtmlTemplate(meta: {
	title: string;
	description: string;
	canonical: string;
	social?: {
		title?: string;
		description?: string;
		image?: string;
	};
	/** HTML content for the page, which will go inside a <main> element before the site header and footer. */
	content: string;
}) {
	meta = { ...meta };
	if (!meta.canonical.startsWith('https://')) {
		meta.canonical = asCanonicalUrl(meta.canonical);
	}
	if (meta.social?.image && !meta.social.image.startsWith('https://')) {
		meta.social.image = asCanonicalUrl(meta.social.image);
	}
	return html`
		<!doctype html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<!-- Feeds -->
				<link rel="alternate" type="application/rss+xml" href="/feed.rss" />
				<link rel="alternate" type="application/atom+xml" href="./feed.atom" />
				<link rel="alternate" type="application/feed+json" href="./feed.json" />
				<!-- Page Details -->
				<title>${escapeHtml(meta.canonical)}</title>
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
				<meta name="robots" content="index, follow" />
				<link rel="canonical" href="${escapeHtml(meta.canonical)}" />
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
}
