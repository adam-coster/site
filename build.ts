import {
	ensureDir,
	listContentFiles,
	readJsonFile,
	readTextFile,
	writeJson,
} from './build.utilities.ts';
import { copyFile, writeFile } from 'node:fs/promises';
import { processMarkdownPage } from './build.markdown.ts';
import lunr from 'lunr';
import { createArticleMicrodata } from './schemas/microdata.ts';
import { populateHtmlTemplate } from './templates/page.ts';
import { ok } from 'node:assert';
import type { SiteContent } from './schemas/content.metadata.ts';

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
const siteContent: SiteContent = [];

for (const file of sourceFiles) {
	if (file.kind === 'static') {
		// Just copy it! But strip off the '$' prefix
		await copyFile(file.path, `${outDir}/${file.name.slice(1)}`);
		unusedSourceFiles.delete(file.name);
		continue;
	} else if (['jpg', 'png', 'gif', 'jpeg', 'js', 'json'].includes(file.type)) {
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

	let html: string | undefined;
	if (file.type === 'md' && !file.id) {
		// Then this is a markdown page!
		const md = await readTextFile(file.path);
		const content = processMarkdownPage(file.slug, md);
		microdatas.push(createArticleMicrodata(content.meta));
		html = await populateHtmlTemplate({
			title: content.meta.title,
			slug: file.slug,
			description: content.meta.description,
			canonical: content.meta.canonical,
			content: content.html,
			ldjsons: microdatas,
		});
		unusedSourceFiles.delete(file.name);
		searchDocs.push({
			slug: file.slug,
			...content.meta,
			body: content.body,
		});
		siteContent.push({
			...content.meta,
			path: `/${file.slug}`,
		});
	} else if (file.type === 'ts' && !file.id) {
		const { page } = await import(`./content/${file.name}`);
		ok(
			typeof page === 'string',
			`Unexpected type of page import, got ${typeof page} `,
		);
		html = page;
		unusedSourceFiles.delete(file.name);
		// TODO: Search content?
		// TODO: Metadata?
	}

	if (html) {
		const outFile =
			file.slug === 'index'
				? `${outDir}/index.html`
				: `${await ensureDir(`${outDir}/${file.slug}`)}/index.html`;
		await writeFile(outFile, html);
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
await writeJson(`${outDir}/index.json`, siteContent);
