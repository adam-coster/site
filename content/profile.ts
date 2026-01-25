import type { PersonSchema, ProfilePageSchema } from '../schemas/microdata.ts';
import { asCanonicalUrl } from '../utilities/urls.ts';

export const identityTypes = ['domain', 'social', 'reference'] as const;
export type IdentityType = (typeof identityTypes)[number];
interface DigitalIdentity {
	name: string;
	title?: string;
	url: string;
	type: IdentityType;
}

export const digitalIdentities: DigitalIdentity[] = [
	{
		url: 'https://github.com/adam-coster',
		name: 'GitHub',
		type: 'social',
	},
	{
		url: 'https://twitter.com/costerad',
		name: 'Twitter',
		type: 'social',
	},
	{
		url: 'https://bsky.app/profile/adamcoster.com',
		name: 'Bluesky',
		type: 'social',
	},
	{
		url: 'https://www.instagram.com/adamncoster/',
		name: 'Instagram',
		type: 'social',
	},
	{
		url: 'https://www.linkedin.com/in/adamcoster/',
		name: 'LinkedIn',
		type: 'social',
	},
	{
		url: 'https://adamcoster.com',
		name: 'adamcoster.com',
		type: 'domain',
	},
	{
		url: 'https://coster.dev',
		name: 'coster.dev',
		type: 'domain',
	},
	{
		url: 'https://bscotch.net/about#adam-coster',
		name: 'bscotch.net',
		type: 'reference',
	},
	{
		url: 'https://www.facebook.com/costerad',
		name: 'Facebook',
		type: 'social',
	},
	{
		url: 'https://dev.to/adamcoster',
		name: 'Dev.to',
		type: 'social',
	},
	{
		url: 'https://www.imdb.com/name/nm8710320/',
		name: 'IMDB',
		type: 'reference',
	},
	{
		url: 'https://adamcoster.medium.com/',
		name: 'Medium',
		type: 'social',
	},
	{
		url: 'https://www.mobygames.com/person/1042863/adam-coster/',
		name: 'MobyGames',
		type: 'reference',
	},
	{
		url: 'https://stackoverflow.com/users/5346534/bscotchadam',
		name: 'Stack Overflow',
		type: 'social',
	},
	{
		url: 'https://www.gamesindustry.biz/articles/?author=2243',
		name: 'GamesIndustry.biz',
		type: 'reference',
	},
	{
		url: 'https://www.gamedeveloper.com/author/adam-coster',
		name: 'GameDeveloper.com',
		type: 'social',
	},
	{
		url: 'https://scholar.google.com/citations?hl=en&user=cU1y6RoAAAAJ',
		name: 'Google Scholar',
		type: 'social',
	},
];

digitalIdentities.sort((a, b) => {
	if (a.type === b.type) {
		return a.name.localeCompare(b.name);
	}
	if (identityTypes.indexOf(a.type) < identityTypes.indexOf(b.type)) {
		return -1;
	}
	return 1;
});

export const me: PersonSchema = {
	'@type': 'Person',
	name: 'Adam Coster',
	givenName: 'Adam',
	familyName: 'Coster',
	honorificSuffix: 'PhD',
	description:
		'Web developer and founder at video game studio Butterscotch Shenanigans. PhD in Cell & Molecular Biology. Co-host of podcast "Coffee with Butterscotch".',
	sameAs: digitalIdentities.map(p => p.url),
	alumniOf: [
		{
			'@type': 'CollegeOrUniversity',
			name: 'University of Chicago',
			sameAs: 'https://www.uchicago.edu',
		},
		{
			'@type': 'CollegeOrUniversity',
			name: 'University of Texas Southwestern Graduate School of Biomedical Sciences',
			sameAs: 'https://www.utsouthwestern.edu/education/graduate-school',
		},
	],
	image: asCanonicalUrl('/profile.portrait.1372.jpg'),
	memberOf: 'Butterscotch Shenanigans',
	worksFor: 'Butterscotch Shenanigans',
	jobTitle: 'CTO',
	url: asCanonicalUrl('/'),
};

export const profile: ProfilePageSchema = {
	'@type': 'ProfilePage',
	mainEntity: me,
};
