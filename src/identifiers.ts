export const identityTypes = ['domain', 'social', 'author', 'profile'] as const;
export type IdentityType = (typeof identityTypes)[number];
type DigitalIdentity =
	| SocialIdentity
	| DomainIdentity
	| ReferenceIdentity
	| AuthorIdentity;
interface SocialIdentity {
	type: 'social';
	name: string;
	url: string;
	handle: string;
}
interface DomainIdentity {
	type: 'domain';
	name: string;
	url?: string;
}
interface ReferenceIdentity {
	type: 'profile';
	name: string;
	url: string;
}
interface AuthorIdentity {
	type: 'author';
	name: string;
	url: string;
	handle?: string;
}

export const digitalIdentities: DigitalIdentity[] = [
	{
		url: 'https://github.com/adam-coster',
		name: 'GitHub',
		handle: 'adam-coster',
		type: 'author',
	},
	{
		url: 'https://twitter.com/costerad',
		name: 'Twitter',
		handle: 'costerad',
		type: 'social',
	},
	{
		url: 'https://bsky.app/profile/adamcoster.com',
		name: 'Bluesky',
		handle: 'adamcoster.com',
		type: 'social',
	},
	{
		url: 'https://www.instagram.com/adamncoster/',
		name: 'Instagram',
		handle: 'adamncoster',
		type: 'social',
	},
	{
		url: 'https://www.reddit.com/user/bscotchAdam/',
		name: 'reddit',
		handle: 'bscotchadam',
		type: 'social',
	},
	{
		url: 'https://www.linkedin.com/in/adamcoster/',
		name: 'LinkedIn',
		handle: 'adamcoster',
		type: 'social',
	},
	{ url: 'https://adamcoster.com', name: 'adamcoster.com', type: 'domain' },
	{ name: 'adam-coster.com', type: 'domain' },
	{ name: 'coster.dev', type: 'domain' },
	{
		url: 'https://bscotch.net/about#adam-coster',
		name: 'bscotch.net',
		type: 'profile',
	},
	{
		url: 'https://www.facebook.com/costerad',
		name: 'Facebook',
		handle: 'costerad',
		type: 'social',
	},
	{
		url: 'https://dev.to/adamcoster',
		name: 'Dev.to',
		handle: 'adamcoster',
		type: 'author',
	},
	{
		url: 'https://www.imdb.com/name/nm8710320/',
		name: 'IMDB',
		type: 'profile',
	},
	{ url: 'https://adamcoster.medium.com/', name: 'Medium', type: 'author' },
	{
		url: 'https://www.mobygames.com/person/1042863/adam-coster/',
		name: 'MobyGames',
		type: 'profile',
	},
	{
		url: 'https://stackoverflow.com/users/5346534/bscotchadam',
		name: 'Stack Overflow',
		type: 'author',
		handle: 'bscotchadam',
	},
	{
		url: 'https://www.gamesindustry.biz/articles/?author=2243',
		name: 'GamesIndustry.biz',
		type: 'author',
	},
	{
		url: 'https://www.gamedeveloper.com/author/adam-coster',
		name: 'GameDeveloper.com',
		type: 'author',
	},
	{
		url: 'https://scholar.google.com/citations?user=cU1y6RoAAAAJ',
		name: 'Google Scholar',
		type: 'author',
	},
];

export function digitalIdentitySlug(id: DigitalIdentity): string {
	return id.name.toLowerCase().replace(/[^a-z0-9_.-]/, '-');
}

/** Given a  */
export function digitalIdentityUrl(id: DigitalIdentity): string {
	return `/about#${digitalIdentitySlug(id)}`;
}

digitalIdentities.sort((a, b) => {
	if (a.type === b.type) {
		return a.name.localeCompare(b.name);
	}
	if (identityTypes.indexOf(a.type) < identityTypes.indexOf(b.type)) {
		return -1;
	}
	return 1;
});
