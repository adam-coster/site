// @ts-check
import { defineConfig } from "astro/config";
import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

/** @type {Record<string, string>} */
const PAGEFIND_CONTENT_TYPES = {
  ".js": "application/javascript",
  ".json": "application/json",
  ".css": "text/css",
};

// https://astro.build/config
export default defineConfig({
  experimental: {
    contentIntellisense: true,
    headingIdCompat: true,
  },
  vite: {
    plugins: [
      {
        // Vite refuses to serve files from public/ as importable modules.
        // This middleware intercepts /pagefind/* requests before Vite's module
        // pipeline runs and serves them directly from public/pagefind/.
        // If public/pagefind/ doesn't exist yet (before the first build),
        // requests fall through and the import fails, triggering the
        // text-filter fallback in the search script.
        name: "pagefind-dev",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (!req.url?.startsWith("/pagefind/")) return next();
            const filePath = join(
              process.cwd(),
              "public",
              req.url.split("?")[0]
            );
            if (!existsSync(filePath)) return next();
            res.setHeader(
              "Content-Type",
              PAGEFIND_CONTENT_TYPES[extname(filePath)] ??
                "application/octet-stream"
            );
            res.end(readFileSync(filePath));
          });
        },
      },
    ],
    build: {
      rollupOptions: {
        // /pagefind/pagefind.js is generated at build time and does not exist
        // during the Vite client build step — it must remain a runtime import.
        external: ["/pagefind/pagefind.js"],
      },
    },
  },
});
