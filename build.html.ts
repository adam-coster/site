import prettier from 'prettier';
import { readJsonFile } from './build.utilities.ts';

const config = (await readJsonFile('.prettierrc')) as any;

export async function formatHtml(html: string): Promise<string> {
	return await prettier.format(html, { ...config, parser: 'html' });
}
