// @ts-expect-error
import _index from '/index.json' with { type: 'json' };
/** @type {import('../schemas/content.metadata.ts').SiteContent}*/
const index = _index;

// On load, use whatever search term came with the URL
/** @type {string} */
let query = new URL(location.href).searchParams.get('search') || '';

const searchInputEl = /** @type {HTMLInputElement} */ (
	document.getElementById('c3c693681-aeda-43c9-a174-c705de2a5a12')
);
searchInputEl.addEventListener('input', oninput);

/** @param {string} query */
export function search(query) {
	// TODO: Debounce
	// TODO: if query, lazy load the search index and find matching stuff
	// TODO: Populate the list with results
	return index;
}

/** @param {InputEvent & {target:EventTarget & HTMLInputElement}} e */
function oninput(e) {
	const query = e.target.value || '';
	updateListing(query);
}

/** @param {string} qs */
function updateListing(qs) {
	if (qs) {
		// Then we gotta import the search index!
	}
}
