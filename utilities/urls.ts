export function asCanonicalUrl(url = '/') {
	let canonical: URL;
	if (url.match(/^https?:\/\//)) {
		canonical = new URL(url);
	} else {
		canonical = new URL(`https://adamcoster.com${url}`);
	}
	// If external, leave it alone. Otherwise clean it up!
	if (!canonical.host.endsWith('adamcoster.com')) {
		return url;
	}
	// Remove trailing slash
	canonical.pathname = canonical.pathname.replace(/\/$/, '');
	// Remove query params
	canonical.search = '';
	return canonical.toString();
}
