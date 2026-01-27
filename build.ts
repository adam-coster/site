import {
	ensureDir,
	listContentFiles,
	readJsonFile,
	readTextFile,
	writeJson,
} from './build.utilities.ts';
import { copyFile, writeFile } from 'node:fs/promises';
import { articleSchema } from './schemas/article.schema.ts';
import { processMarkdownPage } from './build.markdown.ts';
import { formatHtml } from './build.html.ts';
import lunr from 'lunr';
import { createArticleMicrodata, ldJsonify } from './schemas/microdata.ts';

const outDir = await ensureDir('dist', true);
const sourceDir = 'content';
const sourceFiles = await listContentFiles(sourceDir);
const unusedSourceFiles = new Map(sourceFiles.map(f => [f.name, f]));
const searchDocs: {
	slug: string;
	title: string;
	description: string;
	tags: string[];
	body: string;
}[] = [];

// Keep the schema file up to date for re
await writeFile(
	'./schemas/article.schema.json',
	JSON.stringify(articleSchema.toJSONSchema(), null, 2),
);

for (const file of sourceFiles) {
	if (file.kind === 'static') {
		// Just copy it! But strip off the '$' prefix
		await copyFile(file.path, `${outDir}/${file.name.slice(1)}`);
		unusedSourceFiles.delete(file.name);
		continue;
	} else if (['jpg', 'png', 'gif', 'jpeg'].includes(file.type)) {
		await copyFile(file.path, `${outDir}/${file.name}`);
		unusedSourceFiles.delete(file.name);
		continue;
	}
	const microdatas: any[] = [];
	if (!file.id) {
		const matchingJsonLds = sourceFiles.filter(
			f => f.kind === 'content' && f.slug === file.slug && f.type === 'jsonld',
		);
		microdatas.push(
			...((await Promise.all(
				matchingJsonLds.map(ld => {
					unusedSourceFiles.delete(ld.name);
					return readJsonFile(ld.path);
				}),
			)) as any[]),
		);
	}

	if (file.type === 'md' && !file.id) {
		// Then this is a markdown page!
		const md = await readTextFile(file.path);
		const content = processMarkdownPage(file.slug, md);
		microdatas.push(createArticleMicrodata(content.meta));
		const microdataString = ldJsonify(microdatas);
		// TODO: Needs header, footer, meta, JSONLD, etc
		let html = await formatHtml(
			`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${content.meta.title}</title>${microdataString}</head><body>${content.html}</body></html>`,
		);
		const outFile = `${await ensureDir(`${outDir}/${file.slug}`)}/index.html`;
		await writeFile(outFile, html);
		searchDocs.push({
			slug: file.slug,
			...content.meta,
			body: content.body,
		});
		unusedSourceFiles.delete(file.name);
	}
}

if (unusedSourceFiles.size > 0) {
	console.error('Some files not used during build:');
	console.error(unusedSourceFiles.keys());
	if (process.env.CI) {
		throw new Error('All files must be used during build!');
	}
}

// Search index.
const searchIndex = lunr(function () {
	this.ref('slug');
	this.field('title', { boost: 5 });
	this.field('description', { boost: 3 });
	this.field('tags', { boost: 2 });
	this.field('body');
	searchDocs.forEach(doc => this.add(doc));
});

// Note: should be tagged for caching
await writeJson(`${outDir}/search.json`, searchIndex);
