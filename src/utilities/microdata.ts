import { ok } from 'node:assert';
import type {
	Article,
	Person,
	ProfilePage,
	Recipe,
	WebSite,
	WithContext,
} from 'schema-dts';
import { dateToIso } from '../utilities/dates.ts';
import { asCanonicalUrl } from '../utilities/urls.ts';

// ClaimReview and FAQPage are both supported by Google
// - ClaimReview: Fact-Check (indicate truthiness of something)
// - FAQPage: Any kind of QA format, yielding rich results
// - QAPage: If answers can be submitted and ranked/selected as "best"
// - HowTo: Anything with step-by-step instructions
// - Speakable: Specify parts of the page that can be read with TTL, e.g. via Google Assistant (requires review), only a few sentences worth (headline & summary, basically)
// See https://developers.google.com/search/docs/advanced/structured-data/search-gallery for all

type FullSchema<
	SchemaUnion,
	Type extends string = string,
> = SchemaUnion extends { '@type': Type } ? SchemaUnion : never;

// Google doesn't officially support this one...
// But it can be used *within* other ones in author and
// related fields.
export type PersonSchema = FullSchema<Person, 'Person'>;

export type WebSiteSchema = FullSchema<WebSite, 'WebSite'>;

export type ArticleSchema = FullSchema<Article, 'Article'>;

export type RecipeSchema = FullSchema<Recipe, 'Recipe'>;

export type ProfilePageSchema = FullSchema<ProfilePage, 'ProfilePage'>;

export type MicrodataSchema =
	| PersonSchema
	| WebSiteSchema
	| ArticleSchema
	| RecipeSchema
	| ProfilePageSchema;

export function ldJsonify<T extends MicrodataSchema>(schemas: T[]) {
	if (!schemas.length) {
		return '';
	}
	const schemaClones: WithContext<T>[] = schemas.map(schema => {
		ok(schema['@type'], '@type is required');
		return {
			'@context': 'https://schema.org',
			...schema,
		};
	});
	const asString = `<script type="application/ld+json">${
		JSON.stringify(schemaClones, null, '\t') + '<'
	}/script>`;
	return asString;
}

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
		'Web developer and founder at video game studio Butterscotch Shenanigans. Creator of LudoKit. PhD in Cell & Molecular Biology. Co-host of podcast "Coffee with Butterscotch".',
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

/**
 * @see https://developers.google.com/search/docs/advanced/structured-data/article#non-amp
 */
export function createArticleMicrodata(info: {
	title: string;
	/**
	 * If provided, images must belong to the article,
	 * crawlable & indexable, high-rez, preferred to
	 * have all of 16x9, 4x3, and 1x1 aspect ratios in
	 * any of BMP, GIF, JPEG, PNG, WebP, and SVG
	 */
	images?: string[];
	publishedAt?: string | Date;
	editedAt?: Date | string;
}): ArticleSchema {
	const datePublished = dateToIso(info.publishedAt || new Date());
	// Google requires headline length to be no more than 110 characters
	const maxHeadlineLength = 110;
	const headline =
		info.title.length > maxHeadlineLength
			? info.title.slice(0, maxHeadlineLength - 1) + '…'
			: info.title;
	return {
		'@type': 'Article',
		headline,
		author: me,
		datePublished,
		dateModified: info.editedAt
			? dateToIso(new Date(info.editedAt))
			: datePublished,
		image: info.images?.map(asCanonicalUrl),
	};
}
