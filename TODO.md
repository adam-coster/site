# TODO

- [ ] Find all content and get it _normalized_ into [/content](/content/)
- [ ] Write a script that can process all of that content to convert it into HTML, extract text for indexing, extract structured data for microdata, etc.
- [ ] Create a build process that assembles the whole site.

## Content Normalization

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
    - Any files named `{slug}.{whatever}.ld.json` will be treated as _additional_ microdata to be added to the built `/{slug}` HTML.
