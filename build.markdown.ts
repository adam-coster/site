import { ok } from 'node:assert';
import { Marked } from 'marked';
import { articleSchema } from './schemas/article.schema.ts';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

const marked = new Marked(
	markedHighlight({
		emptyLangClass: 'hljs',
		langPrefix: 'hljs language-',
		highlight(code, lang) {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			return hljs.highlight(code, { language }).value;
		},
	}),
);

export function processMarkdownPage(slug: string, md: string) {
	try {
		// Get the frontmatter and body
		const lines = md.split(/\r?\n/);
		ok(lines[0] === '---json');
		const frontEnd = lines.findIndex(l => l === '---');
		ok(frontEnd !== -1, `Missing frontmatter in ${slug}`);
		const meta = JSON.parse(lines.slice(1, frontEnd).join('\n'));
		const body = lines.slice(frontEnd + 1).join('\n');
		const html = marked.parse(body, { async: false });
		return {
			html,
			body,
			meta: articleSchema.parse(meta),
		};
	} catch (err) {
		console.error(slug);
		throw err;
	}
}
