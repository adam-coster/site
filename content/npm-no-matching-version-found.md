---json
{
  "$schema": "../schemas/article.schema.json",
  "title": "How to fix npm's \"notarget No matching version found\" error",
  "description": "It's a caching issue. Run `npm cache clean --force` and you're good to go.",
  "publishedAt": "2025-06-03T23:44:48.602Z",
  "tags": [
    "npm",
    "node",
    "javascript"
  ],
  "crossPosts": []
}
---

If you're seeing an error like this when trying to `npm install` something:
```sh
npm ERR! code ETARGET
npm ERR! notarget No matching version found for some-package@version
```
But you know for a FACT that that package (and version) definitely exists and is on npm, then it's probably a local caching issue.

Fix it with:

```sh
npm cache clean --force
```

It might take a while to run. But then you can `npm install` as usual.

In my case (on Windows) I get an error about trying to delete a non-empty directory, but it still resolved the problem so SHRUG.