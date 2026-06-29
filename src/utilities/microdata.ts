import { ok } from 'node:assert';
import type {
	Article,
	Person,
	ProfilePage,
	Recipe,
	WebSite,
	WithContext,
} from 'schema-dts';
import { digitalIdentities } from '../identifiers.ts';
import { dateToIso } from '../utilities/dates.ts';
import { asCanonicalUrl } from '../utilities/urls.ts';

// ClaimReview and FAQPage are both supported by Google
// - ClaimReview: Fact-Check (indicate truthiness of something)
// - FAQPage: Any kind of QA format, yielding rich results
// - QAPage: If answers can be submitted and ranked/selected as "best"
// - HowTo: Anything with step-by-step instructions
// - Speakable: Specify parts of the page that can be read with TTL, e.g. via Google Assistant (requires review), only a few sentences worth (headline & summary, basically)
// See https://developers.google.com/search/docs/advanced/structured-data/search-gallery for all

type FullSchema<SchemaUnion, Type extends string = string> =
	SchemaUnion extends { '@type': Type } ? SchemaUnion : never;

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
	const schemaClones: WithContext<T>[] = schemas.map((schema) => {
		ok(schema['@type'], '@type is required');
		return { '@context': 'https://schema.org', ...schema };
	});
	const asString = `<script type="application/ld+json">${
		JSON.stringify(schemaClones, null, '\t') + '<'
	}/script>`;
	return asString;
}

export const me: PersonSchema = {
	'@type': 'Person',
	name: 'Adam Coster',
	givenName: 'Adam',
	familyName: 'Coster',
	honorificSuffix: 'PhD',
	description:
		'Web developer and founder at video game studio Butterscotch Shenanigans. Creator of LudoKit. PhD in Cell & Molecular Biology. Co-host of podcast "Coffee with Butterscotch".',
	sameAs: digitalIdentities.filter((p) => Boolean(p.url)).map((p) => p.url!),
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
	url: asCanonicalUrl('/about'),
};

export const profile: ProfilePageSchema = {
	'@type': 'ProfilePage',
	mainEntity: me,
};

/**
 * For showing on the landing page, enabling Google
 * to populate a functional searchbox
 * @see https://developers.google.com/search/docs/advanced/structured-data/sitelinks-searchbox
 */
export const siteData: WebSiteSchema = {
	'@type': 'WebSite',
	name: 'Adam Coster',
	alternateName: ['adamcoster.com', 'adam-coster'],
	url: asCanonicalUrl('/'),
	author: me,
	potentialAction: {
		'@type': 'SearchAction',
		target: {
			'@type': 'EntryPoint',
			urlTemplate: `${asCanonicalUrl('/articles')}?search={search_term_string}`,
		},
		// @ts-expect-error (see https://developers.google.com/search/docs/advanced/structured-data/sitelinks-searchbox)
		'query-input': 'required name=search_term_string',
	},
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
		info.title.length > maxHeadlineLength ?
			info.title.slice(0, maxHeadlineLength - 1) + '…'
		:	info.title;
	return {
		'@type': 'Article',
		headline,
		author: me,
		datePublished,
		dateModified:
			info.editedAt ? dateToIso(new Date(info.editedAt)) : datePublished,
		image: info.images?.map(asCanonicalUrl),
	};
}
