import { ok } from 'node:assert';
import type {
	Article,
	Person,
	WebSite,
	WithContext,
	Recipe,
	ProfilePage,
} from 'schema-dts';
import { dateToIso } from '../utilities/dates.ts';
import { me } from '../content/profile.ts';
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

/**
 * @see https://developers.google.com/search/docs/advanced/structured-data/article#non-amp
 */
export function createArticleMicrodata(info: {
	headline: string;
	/**
	 * If provided, images must belong to the article,
	 * crawlable & indexable, high-rez, preferred to
	 * have all of 16x9, 4x3, and 1x1 aspect ratios in
	 * any of BMP, GIF, JPEG, PNG, WebP, and SVG
	 */
	images?: string[];
	datePublished: string | Date;
	dateModified?: Date | string;
}): ArticleSchema {
	const datePublished = dateToIso(info.datePublished);
	// Google requires headline length to be no more than 110 characters
	const maxHeadlineLength = 110;
	const headline =
		info.headline.length > maxHeadlineLength
			? info.headline.slice(0, maxHeadlineLength - 1) + '…'
			: info.headline;
	return {
		'@type': 'Article',
		headline,
		author: me,
		datePublished,
		dateModified: info.dateModified
			? dateToIso(new Date(info.dateModified))
			: datePublished,
		image: info.images?.map(asCanonicalUrl),
	};
}
