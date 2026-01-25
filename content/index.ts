import type { WebSiteSchema } from '../schemas/microdata.ts';
import { asCanonicalUrl } from '../utilities/urls.ts';
import { me } from './profile.ts';

/**
 * For showing on the landing page, enabling Google
 * to populate a functional searchbox
 * @see https://developers.google.com/search/docs/advanced/structured-data/sitelinks-searchbox
 */
export const site: WebSiteSchema = {
	'@type': 'WebSite',
	name: 'Adam Coster',
	alternateName: ['adamcoster.com', 'adam-coster'],
	url: asCanonicalUrl('/'),
	author: me,
	potentialAction: {
		'@type': 'SearchAction',
		target: {
			'@type': 'EntryPoint',
			urlTemplate: `${asCanonicalUrl('/')}?search={search_term_string}`,
		},
		// @ts-ignore (see https://developers.google.com/search/docs/advanced/structured-data/sitelinks-searchbox)
		'query-input': 'required name=search_term_string',
	},
};
