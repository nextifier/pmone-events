/**
 * Shared cache-TTL tables for the Cloudflare edge-caching strategy.
 *
 * This table is the single source of truth for WHAT may be cached. Anything not
 * listed here is never stored — that is the safety property the whole design
 * rests on, so widening it requires an audit, not a guess.
 *
 * Consumed by:
 *  - layers/base/server/middleware/00.edge-cache.ts — decides whether to look a
 *    request up in the Cloudflare Cache API.
 *  - layers/base/server/plugins/cacheControl.ts — sets `cache-control` on 200
 *    GET responses (that header becomes the stored entry's edge TTL) and writes
 *    the response into the Cache API.
 *
 * HISTORY (do not undo): these TTLs used to feed a per-zone Cache Rule. That
 * stopped working on 21 Jul 2026 when the deploy preset moved from
 * `cloudflare-pages` to `cloudflare_module` — a Worker runs BEFORE Cloudflare's
 * cache, so a Cache Rule can never cache a Worker response. Caching now happens
 * inside the Worker via the Cache API. See server/utils/edgeCache.ts.
 *
 * Kept OUT of routeRules on purpose: routeRules headers are all written into the
 * generated `_headers` file, which has a 100-rule limit. Locale-expanded HTML
 * rules blew past it and knocked out critical rules (sw.js no-cache, /_nuxt
 * immutable). Runtime headers also let us restrict caching to status 200 — a
 * 404/302 under /news/** is never edge-cached.
 *
 * TTLs are a SAFETY NET, not the delivery mechanism. Content reaches visitors
 * because the PM One dashboard purges the exact URLs on publish; these windows
 * only bound how stale things can get if a purge fails.
 */

export const HTML_TTL = "public, max-age=0, s-maxage=3600"; // 1 h edge
export const HTML_TTL_LONG = "public, max-age=0, s-maxage=21600"; // 6 h edge
// Pages whose content is effectively frozen (legal text, contact, forms shell).
// These used to be prerendered at build; they are cached instead so dashboard
// edits to nav/appearance/identity reach them without a rebuild.
export const HTML_TTL_STATIC = "public, max-age=0, s-maxage=21600"; // 6 h edge
// max-age=0: the browser cache is the one layer no invalidation can reach, so
// admin edits would sit behind it for its full lifetime. Only the edge caches.
export const API_TTL = "public, max-age=0, s-maxage=600";
// Admin-toggled settings must propagate fast even if a purge is missed.
export const API_TTL_SHORT = "public, max-age=0, s-maxage=120";
// OG cards hash their props into the URL, so a long window is self-busting.
// nuxt-og-image sets its own header on /_og/d/**; this entry exists so the
// edge-cache middleware treats those routes as cacheable at all.
export const OG_TTL = "public, max-age=2592000, s-maxage=2592000, immutable";

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
  "/gallery": HTML_TTL,
  "/programs": HTML_TTL,
  "/faq": HTML_TTL,
  "/partners": HTML_TTL,
  "/links": HTML_TTL,
  "/tickets": HTML_TTL,
  "/hotels": HTML_TTL,

  // Formerly prerendered at build time (see modules/cf-cache.ts, now removed).
  // Prerendering baked the dashboard-managed nav/appearance/identity payload
  // into them, so changing nav in PM One left these 11 pages stale until the
  // next code deploy. Serving them SSR + edge cache removes the last reason a
  // content change would ever need a rebuild.
  "/privacy": HTML_TTL_STATIC,
  "/terms": HTML_TTL_STATIC,
  "/event-policy": HTML_TTL_STATIC,
  "/help-center": HTML_TTL_STATIC,
  "/ticket-terms-and-conditions": HTML_TTL_STATIC,
  "/ticket-refund-and-return-policy": HTML_TTL_STATIC,
  "/media-partner-registration": HTML_TTL_STATIC,
  "/sponsorship-registration": HTML_TTL_STATIC,
  "/contact": HTML_TTL_STATIC,
  "/book-space": HTML_TTL_STATIC,
  "/winner": HTML_TTL_STATIC,

  // App-specific static pages, previously declared per app via the removed
  // `cfCache.extraStaticPages` option (global-ai-expo, panorama-events). Listing
  // them globally is harmless: an app without the route simply 404s, and 404s
  // are never cached.
  "/speakers": HTML_TTL_STATIC,
  "/brand-guidelines": HTML_TTL_STATIC,
  "/quotation": HTML_TTL_STATIC,
  "/about": HTML_TTL_STATIC,
  "/services": HTML_TTL_STATIC,
};

// Prefix HTML rules (trailing slash = only children), after locale strip.
export const CACHED_HTML_PREFIX: Record<string, string> = {
  "/news/": HTML_TTL,
  "/brands/": HTML_TTL,
  "/guests/": HTML_TTL,
  // Public embeddable forms. The SSR shell is identical per slug+locale
  // (prefill + duplicate check are client-side after mount), so edge-caching
  // it is safe like /news/*.
  "/forms/": HTML_TTL,
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
  "/api/event/website-settings": API_TTL_SHORT,
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
  // Public form endpoints: only the GET show route is cacheable. submit +
  // upload are POST/DELETE (skipped - plugin only touches GET) and /check
  // self-sets `private, no-store`. WARNING: any NEW per-user GET added under
  // /api/forms/ MUST self-set no-store, or this prefix rule will edge-cache it.
  "/api/forms/": API_TTL_SHORT,
  // @nuxt/icon's collection endpoint (`?icons=a,b,c`). ~13k requests/day — the
  // third-largest source of Worker invocations. Content is immutable icon
  // geometry keyed by the query string, and the module already sets a 7-day
  // header of its own; listing it here is what makes the edge-cache middleware
  // treat it as cacheable. Do NOT "fix" this with icon.fallbackToApi:false —
  // that breaks icons whose collection name comes from dashboard data and so
  // cannot be found by clientBundle's static scan.
  "/api/_nuxt_icon/": "public, max-age=604800, s-maxage=604800, immutable",
  // Dynamically rendered OG cards. The takumi renderer is expensive, so these
  // must be cached; the URL hashes its props, making a 30-day TTL self-busting.
  "/_og/": OG_TTL,
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

  // Strip one locale prefix for HTML matching. "/" itself is never cached, but
  // locale homepages ("/id") are distinct cacheable URLs.
  //
  // Why "/" stays uncached even though it is a heavy render: with
  // detectBrowserLanguage.alwaysRedirect, the response for "/" is negotiated
  // from the i18n_locale cookie and then Accept-Language. Caching the default
  // locale's 200 would serve English HTML to a visitor who should have been
  // redirected to /id. Reproducing that negotiation in the cache key means
  // duplicating i18n's logic, which would fail silently as it drifts — so this
  // one route keeps paying for a real render. Everything it links to is cached.
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
