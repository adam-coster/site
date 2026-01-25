import fs from 'fs';

const root = 'projects/site/src/routes/blog/(posts)/';

for (const slug of fs.readdirSync(root)) {
	if (slug.startsWith('+layout')) continue;
	const postPath = `${root}${slug}/+page.md`;
	const metaPath = `${root}${slug}/meta.json`;

	let post = fs.readFileSync(postPath, 'utf8');
	const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
	if (meta.recipe) {
		const recipe = meta.recipe;
		delete meta.recipe;
		recipe['@context'] = 'https://schema.org/';
		recipe['@type'] = 'Recipe';
		fs.writeFileSync(
			`content/${slug}.recipe.jsonld`,
			JSON.stringify(recipe, null, 2),
		);
	}
	meta.$schema = '../schemas/article.schema.json';
	delete meta.slug;

	post = `---json\n${JSON.stringify(meta, null, 2)}\n---\n\n${post}`;
	fs.writeFileSync(`content/${slug}.md`, post);
}
