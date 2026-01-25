import { ensureDir, listContentFiles } from './build.utilities.ts';
import { copyFile } from 'node:fs/promises';

const outDir = await ensureDir('dist', true);
const sourceDir = 'content';
const sourceFiles = await listContentFiles(sourceDir);

console.log(sourceFiles);

for (const file of sourceFiles) {
	if (file.kind === 'static') {
		// Just copy it! But strip off the '$' prefix
		await copyFile(file.path, `${outDir}/${file.name.slice(1)}`);
	}
}
