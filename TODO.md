# TODO

- [ ] Find all content and get it _normalized_ into [/content](/content/)
- [ ] Write a script that can process all of that content to convert it into HTML, extract text for indexing, extract structured data for microdata, etc.
- [ ] Create a build process that assembles the whole site.
- [ ] Somehow deal with existing service worker caches...

## Content Normalization

### Blog Posts

All posts are in `./site/src/routes/blog/(posts)/`, with each post being a `+page.md` and paired `meta.json` file. Some of these posts refer to images, which are in `./projects/site/static/images/` and sorta named after the post that references them but not completely.

1. Rename each post's `+page.md` to `./content/{slug}.md` and add to a `redirects.txt` file as `/blog/{slug} /{slug}`
2. Convert each post's `meta.json` to jsonc frontmatter, extracting any recipes to Article JSON-LD and store it as `./content/{slug}.recipe.jsonld`. (Don't worry about the old FAQPage logic -- only one post used it and WHO CARES)
3. For all locally stored blog-post images, rename to the best-fit `./{slug}.{name}.{ext}` and update links (there aren't many so just do it manually).

### Old /blog

The new site will have the landing page be a SEARCH page. The old site had the landing page essentially be the About/Profile page.

1. Create a `profile.md` (or html) page with profile content
   1. Use a `profile.ts` file to track data for re-use, and to generate anything to insert (like the sets of social media links, etc).

### Tools pages

... not sure what to do about these since they're the only non-static content. Maybe keep as Svelte (just without Kit)? Will have to do some experimenting.

### Approach

All of the content is currently in `./notes` (basically a drafts folder) and `./projects/site`. Notes can be left alone for now, but everything in the `site` project needs to be NORMALIZED for the new setup.

How will all of that get normalized?

The new site will _FLATTEN EVERYTHING_. It's all about SEARCHING, not SORTING! Plus it's nice to be able to re-use content inside of other content on a whim, rather than always having to link to it.

- Every piece of content will like at the root level of `/content`, ensuring that everything MUST have a unique, stable identifier (without requiring a subfolder to get it)
  - Each file will have a URL-friendly slug as a name. Optionally also SEO/human-friendly.
  - Files that go together (like images for a post) will have the same base name and use extensions to differentiate. This doesn't create any referencing-restrictions, it's just for clear organization (e.g. an image could be used in multiple places).
  - If cache-busting becomes useful, will use an external mechanism to track file hashes or something. Leave file names alone so nothing has to get redirected or whatever.
  - Potentially all files will be published as-is, _and_ in transpiled formats. Could go either way at this point. But certainly anything referenced by a page must be available, so why not all of it for simplicity?
- Files ending in `.md` or `.html` are treated as canonical "site pages"
  - `index.md` (or `.html`) is treated as the root URL, `/`.
  - md files will be transformed to HTML and wrapped with a header/footer, with meta details from their _validated_ frontmatter
  - HTML files will have the site header/footer added around their content
    - They'll need to contain info required to generate meta details
  - They'll be available at `/{slug}` (no extension, no trailing slash) on the public site
    - Practically speaking, all pages will be converted into `/{slug}/index.html` and the server will be configured to serve them up as `/{slug}`.
  - They'll be whitelisted in robots.txt and listed in the sitemap
  - Their contents will be added to the search index
  - Any content they _import_ will be added to their search data, and will be imported using type-appropriate mechanisms
  - JSON microdata will be added as necessary, based on the _type_ of thing, unless it's already embedded.
    - Any files named `{slug}.{whatever}.jsonld` will be treated as _additional_ microdata to be added to the built `/{slug}` HTML.
  - Any file ending in `{slug}.{ext}.ts` (or similar) that has an exported `generate()` function will be imported and run at build time, and its content used as if it were called `{slug}.{ext}`. This can be be used to programmatically generate content when needed.
- Will need to deal with all of these changed URLs!
  - Create a `redirects.txt` file containing `from to` pairs per line, which can be used to automatically generate pages where pages _used to be_ and then flag them as non-canonical (or to have a server auto-redirect)
  - Manually add any custom redirects from the old site as well. Redirects upon redirects!

## Handling JSON-LD

The established extension is `.jsonld`. There isn't a lot of tooling for it, unfortunately, but the [`jsonld` npm package](https://www.npmjs.com/package/jsonld) seems to be the go-to tool for doing miscellany with this kind of data. Kinda hard to tell exactly what it can do, so will require some experimentation.

Relevant formats [supported by Google](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) include:

- Article
- Dataset
- Fact Check (being phased out tho)
- FAQ (only government- or health-related are supported)
- Image metadata
- Profile Page
- Q&A
- Recipe
- Review (probably won't show up)
- Video
- Website (for the home page)
