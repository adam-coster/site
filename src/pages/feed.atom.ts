import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const SITE_URL = "https://adamcoster.com";

interface FeedItem {
  url: string;
  title: string;
  description: string;
  tags: string[];
  publishedAt: Date;
  updatedAt: Date;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const GET: APIRoute = async () => {
  const articles = await getCollection("articles");
  // When the tools collection is ready, uncomment and add to items below:
  // const tools = await getCollection("tools");

  const items: FeedItem[] = [
    ...articles
      .filter((a) => a.data.publishedAt !== undefined)
      .map((a) => ({
        url: `${SITE_URL}/articles/${a.id}`,
        title: a.data.title,
        description: a.data.description,
        tags: a.data.tags,
        publishedAt: a.data.publishedAt!,
        updatedAt: a.data.editedAt ?? a.data.publishedAt!,
      })),
    // ...tools
    //   .filter((t) => t.data.publishedAt !== undefined)
    //   .map((t) => ({
    //     url: `${SITE_URL}/tools/${t.id}`,
    //     title: t.data.title,
    //     description: t.data.description,
    //     tags: t.data.tags,
    //     publishedAt: t.data.publishedAt!,
    //     updatedAt: t.data.editedAt ?? t.data.publishedAt!,
    //   })),
  ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const feedUpdated = items[0]?.updatedAt ?? new Date();

  const entries = items
    .map((item) => {
      const categories = item.tags
        .map((tag) => `    <category term="${escapeXml(tag)}"/>`)
        .join("\n");
      return `  <entry>
    <id>${escapeXml(item.url)}</id>
    <title>${escapeXml(item.title)}</title>
    <link href="${escapeXml(item.url)}" rel="alternate" type="text/html"/>
    <published>${item.publishedAt.toISOString()}</published>
    <updated>${item.updatedAt.toISOString()}</updated>
    <summary>${escapeXml(item.description)}</summary>
${categories}
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${SITE_URL}/</id>
  <title>Adam Coster</title>
  <subtitle>Articles and more from Adam Coster.</subtitle>
  <link href="${SITE_URL}/" rel="alternate" type="text/html"/>
  <link href="${SITE_URL}/feed.atom" rel="self" type="application/atom+xml"/>
  <updated>${feedUpdated.toISOString()}</updated>
  <author>
    <name>Adam Coster</name>
    <uri>${SITE_URL}/about</uri>
  </author>
${entries}
</feed>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
};
