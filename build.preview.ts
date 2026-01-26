import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import {
	extensionToMimetype,
	fileExists,
	readTextFile,
} from './build.utilities.ts';

const app = new Hono();
app.get('/:slug?', async c => {
	const { slug } = c.req.param();
	const indexFile = slug ? `./dist/${slug}/index.html` : './dist/index.html';
	if (await fileExists(indexFile)) {
		return c.html(await readTextFile(indexFile));
	}
	if (slug && (await fileExists(`./dist/${slug}`))) {
		return new Response(await readTextFile(`./dist/${slug}`), {
			headers: {
				'Content-Type': extensionToMimetype(slug),
			},
		});
	}
	return c.notFound();
});

serve({ fetch: app.fetch, port: 3000 });
