import fsp from 'node:fs/promises';
type Category = '' | 'articles' | 'tools';
interface ContentFile {
	kind: 'content';
	/** Path to the file */
	path: string;
	folder: string;
	/** Full name of the file */
	name: string;
	category: Category;
	/** The extension (without '.' prefix) */
	type: string;
	/** The name before any '.' characters */
	slug: string;
	/** Anything between the slug and type, if present. Will NOT have a '.' prefix. */
	id?: string;
}
interface StaticFile {
	kind: 'static';
	path: string;
	name: string;
}

export async function listContentFiles(): Promise<
	(ContentFile | StaticFile)[]
> {
	const root = 'content';
	const files = (
		await fsp.readdir(root, { withFileTypes: true, recursive: true })
	).filter(f => f.isFile());
	return files.map(file => {
		const name = file.name;
		const filepath = `${root}/${name}`;
		if (name.startsWith('$')) {
			// Then it's a StaticFile
			return {
				kind: 'static',
				path: filepath,
				name: name,
			};
		}
		const { slug, id, type } = name.match(
			/^(?<slug>[^.]+)(?<id>.*)?(?<type>\.[^.]+)$/,
		)!.groups!;
		return {
			kind: 'content',
			folder: file.parentPath,
			path: file.parentPath + '/' + name,
			name: name,
			category: (file.parentPath.split('/')[1] || '') as Category,
			type: type.slice(1),
			slug,
			id: id?.slice(1),
		};
	});
}

export async function ensureDir<T extends string>(
	path: T,
	nuke?: boolean,
): Promise<T> {
	if (nuke) await nukeDir(path);
	await fsp.mkdir(path, { recursive: true });
	return path;
}

export async function nukeDir(path: string): Promise<void> {
	await fsp
		.access(path)
		.then(async () => {
			await fsp.rm(path, { recursive: true, force: true });
		})
		.catch(() => {
			// Directory does not exist, nothing to do
		});
}

export async function fileExists(path: string): Promise<boolean> {
	try {
		await fsp.access(path);
		return true;
	} catch {
		return false;
	}
}

export async function readTextFile(path: string): Promise<string> {
	return await fsp.readFile(path, 'utf8');
}

export async function readContentFile(name: string): Promise<string> {
	return await fsp.readFile(`content/${name}`, 'utf8');
}

export async function readJsonFile(path: string): Promise<unknown> {
	return JSON.parse(await fsp.readFile(path, 'utf8'));
}

export async function writeJson(path: string, data: unknown): Promise<void> {
	await fsp.writeFile(path, JSON.stringify(data, null, 2), 'utf8');
}

export function extensionToMimetype(ext: string): string {
	// In case it's a full path, strip up to the ext
	ext = ext.replace(/^.*\./, '').toLowerCase();
	switch (ext) {
		case 'html':
		case 'css':
			return `text/${ext}`;
		case 'json':
			return 'application/json';
		case 'js':
			return 'text/javascript';
		case 'png':
		case 'jpeg':
		case 'gif':
			return `image/${ext}`;
		default:
			return 'text/plain';
	}
}
