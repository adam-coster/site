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
