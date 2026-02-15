// @ts-check
import { defineConfig } from 'astro/config';
import { copyFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {Record<string, string>} */
const PAGEFIND_CONTENT_TYPES = {
	'.js': 'application/javascript',
	'.json': 'application/json',
	'.css': 'text/css',
};

/** @type {Record<string, string>} */
const IMAGE_CONTENT_TYPES = {
	'.avif': 'image/avif',
	'.gif': 'image/gif',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp',
};

/**
 * Article images live alongside their markdown files in articles/ and are
 * referenced in markdown as root-relative paths (e.g. /coffee-tonic.jpg).
 * This integration serves them from articles/ in dev and copies them to
 * dist/ at build time.
 *
 * @returns {import('astro').AstroIntegration}
 */
function articleImages() {
	const articlesDir = join(process.cwd(), 'articles');

	/** @param {string} filename */
	function isImage(filename) {
		return IMAGE_CONTENT_TYPES[extname(filename).toLowerCase()] !== undefined;
	}

	return {
		name: 'article-images',
		hooks: {
			'astro:server:setup': ({ server }) => {
				server.middlewares.use((req, res, next) => {
					const urlPath = req.url?.split('?')[0] ?? '';
					const filename = basename(urlPath);
					// Only handle flat root-level image paths like /image.jpg —
					// not sub-paths like /articles/image.jpg.
					if (urlPath !== `/${filename}` || !isImage(filename)) return next();
					const filePath = join(articlesDir, filename);
					if (!existsSync(filePath)) return next();
					res.setHeader(
						'Content-Type',
						IMAGE_CONTENT_TYPES[extname(filename).toLowerCase()],
					);
					res.end(readFileSync(filePath));
				});
			},
			'astro:build:done': ({ dir }) => {
				const distDir = fileURLToPath(dir);
				for (const file of readdirSync(articlesDir)) {
					if (isImage(file)) {
						copyFileSync(join(articlesDir, file), join(distDir, file));
					}
				}
			},
		},
	};
}

// https://astro.build/config
export default defineConfig({
	integrations: [articleImages()],
	experimental: { contentIntellisense: true, headingIdCompat: true },
	vite: {
		plugins: [
			{
				// Vite refuses to serve files from public/ as importable modules.
				// This middleware intercepts /pagefind/* requests before Vite's module
				// pipeline runs and serves them directly from public/pagefind/.
				// If public/pagefind/ doesn't exist yet (before the first build),
				// requests fall through and the import fails, triggering the
				// text-filter fallback in the search script.
				name: 'pagefind-dev',
				configureServer(server) {
					server.middlewares.use((req, res, next) => {
						if (!req.url?.startsWith('/pagefind/')) return next();
						const filePath = join(
							process.cwd(),
							'public',
							req.url.split('?')[0],
						);
						if (!existsSync(filePath)) return next();
						res.setHeader(
							'Content-Type',
							PAGEFIND_CONTENT_TYPES[extname(filePath)] ??
								'application/octet-stream',
						);
						res.end(readFileSync(filePath));
					});
				},
			},
		],
		build: {
			rollupOptions: {
				// /pagefind/pagefind.js is generated at build time and does not exist
				// during the Vite client build step — it must remain a runtime import.
				external: ['/pagefind/pagefind.js'],
			},
		},
	},
});
