import fsp from 'node:fs/promises';

interface ContentFile {
	kind: 'content';
	/** Path to the file */
	path: string;
	/** Full name of the file */
	name: string;
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

export async function listContentFiles(
	path: string,
): Promise<(ContentFile | StaticFile)[]> {
	if (path.endsWith('/')) path = path.slice(0, -1);
	const files = await fsp.readdir(path);
	return files.map(name => {
		const filepath = `${path}/${name}`;
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
			path: `${path}/${name}`,
			name: name,
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

export async function readJsonFile(path: string): Promise<unknown> {
	return JSON.parse(await fsp.readFile(path, 'utf8'));
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
