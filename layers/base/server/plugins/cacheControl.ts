/**
 * Browser-facing `Cache-Control` for the few routes whose own module does not
 * set a usable one.
 *
 * WHY SO SMALL NOW. This used to read a 294-line path→TTL table
 * (shared/cf-cache-rules.ts, deleted 7 Aug 2026) that was almost entirely
 * `max-age=0, s-maxage=N` — edge-only TTLs meant for the in-Worker Cloudflare
 * Cache API. That layer is gone, and on the `cloudflare_module` preset the
 * Worker runs BEFORE Cloudflare's CDN cache, so `s-maxage` on a Worker response
 * is read by nobody. Measured 6 Aug 2026: four consecutive GETs of
 * /sitemap_index.xml returned four different render timestamps, and no Worker
 * response carries `cf-cache-status` at all (static assets, served by the
 * Assets binding rather than the Worker, do — they HIT).
 *
 * So every `max-age=0` entry in that table was decoration. What was NOT
 * decoration is the handful below: they set a real `max-age`, which the visitor's
 * BROWSER honours regardless of what Cloudflare does.
 *
 * The icon endpoint is the one that actually matters. @nuxt/icon emits
 * `s-maxage=604800, stale-while-revalidate` with no `max-age`, so without this
 * override a browser re-fetches every icon collection on every page load —
 * and /api/_nuxt_icon/ was already the third-largest source of Worker
 * invocations (~13k/day) when it WAS cached.
 *
 * Deliberately absent: /_og/**. nuxt-og-image self-injects
 * `public, max-age, s-maxage, immutable` route rules from
 * `ogImage.cacheMaxAgeSeconds`, and hand-writing a rule there suppresses that
 * injection.
 */
const BROWSER_TTL: Array<[string, string]> = [
  // Prefix match. Icon geometry keyed by the query string — immutable.
  ["/api/_nuxt_icon/", "public, max-age=604800, s-maxage=604800, immutable"],
  ["/__sitemap__/", "public, max-age=600, s-maxage=3600"],
];

const BROWSER_TTL_EXACT: Record<string, string> = {
  "/robots.txt": "public, max-age=3600, s-maxage=21600",
  "/sitemap_index.xml": "public, max-age=600, s-maxage=3600",
  "/sitemap.xml": "public, max-age=600, s-maxage=3600",
};

function resolveCacheControl(pathname: string): string | undefined {
  if (BROWSER_TTL_EXACT[pathname]) {
    return BROWSER_TTL_EXACT[pathname];
  }
  for (const [prefix, value] of BROWSER_TTL) {
    if (pathname.startsWith(prefix)) {
      return value;
    }
  }
  return undefined;
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("beforeResponse", (event) => {
    if (event.method !== "GET" || getResponseStatus(event) !== 200) {
      return;
    }

    // A handler that opts out wins. /api/forms/[slug]/check sets
    // `private, no-store` because its body is per-visitor; nuxt-robots and
    // @nuxtjs/sitemap set `no-store` in dev. Never override either.
    const existing = String(getResponseHeader(event, "cache-control") ?? "");
    if (/no-store|private/i.test(existing)) {
      return;
    }

    const cacheControl = resolveCacheControl(event.path.split("?")[0]);
    if (cacheControl) {
      setResponseHeader(event, "cache-control", cacheControl);
    }
  });
});
