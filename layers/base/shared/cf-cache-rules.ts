/**
 * Shared cache-TTL tables for the Cloudflare edge-caching strategy.
 *
 * Consumed by:
 *  - layers/base/server/plugins/cacheControl.ts (runtime) — sets
 *    `cache-control` on 200 GET responses so the per-zone Cache Rule
 *    ("use cache-control header if present, bypass if not") caches them.
 *  - layers/base/modules/cf-cache.ts (build) — prerender + _routes.json.
 *
 * Kept OUT of routeRules on purpose: routeRules headers are all written into
 * the generated `_headers` file, which has a 100-rule Cloudflare Pages limit.
 * Locale-expanded HTML rules blew past it and knocked out critical rules
 * (sw.js no-cache, /_nuxt immutable). Runtime headers also let us restrict
 * caching to status 200 — a 404/302 under /news/** is never edge-cached.
 */

export const HTML_TTL = "public, max-age=0, s-maxage=300"; // 5 min edge
export const HTML_TTL_LONG = "public, max-age=0, s-maxage=900"; // 15 min edge
export const API_TTL = "public, max-age=60, s-maxage=300";

// i18n path prefixes to strip before matching HTML routes (superset across
// apps; strategy is prefix_except_default so the default locale has none).
export const LOCALE_CODES = ["en", "id", "zh", "ja", "ko"];

// Exact-path HTML rules, matched after locale-prefix strip.
// /tickets and /hotels are EXACT ONLY — never cache their sub-flows
// (checkout, attendee, order, booking, reservation = per-user/PII).
export const CACHED_HTML_EXACT: Record<string, string> = {
  "/news": HTML_TTL,
  "/brands": HTML_TTL,
  "/rundown": HTML_TTL,
  "/guests": HTML_TTL,
  "/gallery": HTML_TTL_LONG,
  "/programs": HTML_TTL_LONG,
  "/faq": HTML_TTL_LONG,
  "/partners": HTML_TTL_LONG,
  "/links": HTML_TTL,
  "/tickets": HTML_TTL,
  "/hotels": HTML_TTL,
};

// Prefix HTML rules (trailing slash = only children), after locale strip.
export const CACHED_HTML_PREFIX: Record<string, string> = {
  "/news/": HTML_TTL,
  "/brands/": HTML_TTL,
  "/guests/": HTML_TTL,
};

// Exact-path global rules (no locale expansion): public GET API proxies +
// crawler infra. Cloudflare's cache key includes the query string, so
// query-varied endpoints (?placement, ?locale, ?page) cache per-variant.
export const CACHED_GLOBAL_EXACT: Record<string, string> = {
  "/api/editions": API_TTL,
  "/api/event/active": API_TTL,
  "/api/event/faq": API_TTL,
  "/api/event/gallery": API_TTL,
  "/api/event/guests": API_TTL,
  "/api/event/media-coverage": API_TTL,
  "/api/event/partners": API_TTL,
  "/api/event/programs": API_TTL,
  "/api/event/rundown": API_TTL,
  "/api/event/website-settings": API_TTL,
  "/api/banners": API_TTL,
  "/api/blog/posts": API_TTL,
  "/api/project/profile": API_TTL,
  "/api/exhibitors": API_TTL,
  "/robots.txt": "public, max-age=3600, s-maxage=21600",
  "/sitemap_index.xml": "public, max-age=600, s-maxage=3600",
  "/sitemap.xml": "public, max-age=600, s-maxage=3600",
};

// Prefix global rules.
export const CACHED_GLOBAL_PREFIX: Record<string, string> = {
  "/api/event/guests/": API_TTL,
  "/api/event/rundown/": API_TTL,
  "/api/blog/posts/": API_TTL,
  "/api/exhibitors/": API_TTL,
  "/__sitemap__/": "public, max-age=600, s-maxage=3600",
};

/**
 * Resolve the cache-control value for a request pathname (no query string).
 * Returns undefined when the route must NOT be edge-cached ("/", ticket and
 * hotel flows, tracking, contact, anything unlisted).
 */
export function resolveCacheControl(pathname: string): string | undefined {
  if (CACHED_GLOBAL_EXACT[pathname]) {
    return CACHED_GLOBAL_EXACT[pathname];
  }
  for (const [prefix, ttl] of Object.entries(CACHED_GLOBAL_PREFIX)) {
    if (pathname.startsWith(prefix)) {
      return ttl;
    }
  }
  if (pathname.startsWith("/api/")) {
    return undefined;
  }

  // Strip one locale prefix for HTML matching. "/" itself is never cached
  // (its i18n redirect varies by cookie), but locale homepages ("/id") are
  // distinct cacheable URLs.
  let path = pathname;
  let localeStripped = false;
  const seg = path.split("/")[1];
  if (seg && LOCALE_CODES.includes(seg)) {
    path = path.slice(seg.length + 1) || "/";
    localeStripped = true;
  }
  if (path === "/") {
    return localeStripped ? HTML_TTL : undefined;
  }

  if (CACHED_HTML_EXACT[path]) {
    return CACHED_HTML_EXACT[path];
  }
  for (const [prefix, ttl] of Object.entries(CACHED_HTML_PREFIX)) {
    if (path.startsWith(prefix)) {
      return ttl;
    }
  }
  return undefined;
}
