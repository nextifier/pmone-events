/**
 * Shared cache-TTL tables for the Cloudflare edge-caching strategy.
 *
 * This table is the single source of truth for WHAT may be cached. Anything not
 * listed here is never stored — that is the safety property the whole design
 * rests on, so widening it requires an audit, not a guess.
 *
 * Consumed by exactly one file: layers/base/server/plugins/cacheControl.ts,
 * which sets `cache-control` on 200 GET responses. The zone Cache Rule
 * "Respect origin Cache-Control" turns that header into an edge TTL.
 *
 * HISTORY: between 23 Jul and 6 Aug 2026 these TTLs also drove an in-Worker
 * Cloudflare Cache API layer (server/middleware/00.edge-cache.ts +
 * server/utils/edgeCache.ts). That layer was deleted — it saved ~$5-6/month and
 * cost far more than that in correctness: all bots shared one cache key for `/`,
 * so a single crawler sending `Accept-Language: id` pinned a `302 -> /id` onto
 * Googlebot for an hour; transient 404s were cached for an hour; and every
 * cacheable render had its `set-cookie` stripped, which killed i18n locale
 * stickiness. Do not reintroduce it without solving those three first.
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
 *
 * THE SECOND LAYER, and the one that bit us on 25 Jul 2026: every GET proxy in
 * server/api/ is a `defineCachedEventHandler` (maxAge 15). That cache lives
 * INSIDE the worker, so a Cloudflare purge cannot reach it — and SSR reads its
 * payload through it. A purge that lands while that entry is still warm buys
 * nothing: the very next visitor re-renders the page from the STALE payload and
 * the result is stored as fresh HTML for seven days. A banner CTA edited at
 * 03:38 was purged at 03:39:02 and re-cached, still wrong, at 03:39:07.
 *
 * Two rules keep the layers in lockstep — break either and edits fossilise:
 *   1. Those handlers run `swr: false`. With SWR the expired entry is served
 *      while it revalidates in the background, so the request that triggers the
 *      refresh still renders old data — the exact fossilising step above.
 *   2. pmone's PurgeEdgeCache::DEBOUNCE_SECONDS must stay ABOVE that maxAge, so
 *      any handler entry written before the edit has expired by the time the
 *      purge lands. Raising maxAge here means raising the debounce there.
 */

/**
 * List pages and (locale) homepages — 7 days.
 *
 * Safe because every tag that renders on these pages purges them: list pages
 * were covered from day one, and as of phase 2 the pmone backend also purges
 * the homepage variants for blog-posts / banners / media-coverages / events /
 * rundown (the sections the home actually SSRs — BrandPreview is client-side).
 * TTL DEPENDENCY RULE: before raising a route's TTL, verify the tag map in
 * pmone's config/edge-sites.php reaches that route; the TTL is only the
 * fallback when a purge fails.
 */
export const HTML_TTL = "public, max-age=0, s-maxage=604800"; // 7 d edge

/**
 * Detail pages (an article, a brand, a guest) — 7 days.
 *
 * Was 30 days between 23 Jul and 6 Aug 2026. That window was measured to buy
 * nothing over 7 days (~76 renders/day vs ~327, against a 4M ms/day budget)
 * while giving a failed purge a month-long blast radius, so it is back to 7.
 *
 * Safe because invalidation is exact: Post/Brand/Guest/Form each declare
 * `edgeCachePaths()` in the pmone dashboard, so publishing drops that specific
 * URL within seconds. If you ever remove a model's edgeCachePaths(), move its
 * routes back down or edits will sit behind this for a week. Emergency valve:
 * `php artisan edge:purge --project=<x> | --all` in the pmone repo.
 */
export const HTML_TTL_DETAIL = "public, max-age=0, s-maxage=604800"; // 7 d edge

export const HTML_TTL_LONG = "public, max-age=0, s-maxage=604800"; // 7 d edge

/**
 * Pages that render LIVE STOCK — 1 hour.
 *
 * /tickets SSRs price, quota and on-sale dates. Freshness still comes from the
 * purge (pmone's Ticket/TicketPricePhase/TicketSession reserve()+release() now
 * clear the `tickets` tag, which config/edge-sites.php maps to /tickets), so
 * this TTL is only the blast radius when a purge fails. At 7 days a failed
 * purge meant a sold-out ticket stayed "available" for a week — people would
 * click buy and hit a 422. One hour bounds that, and costs nothing measurable:
 * /tickets gets a few hundred requests a day across 16 sites and ~12 colos, so
 * nearly every request already misses.
 */
export const HTML_TTL_LIVE = "public, max-age=0, s-maxage=3600"; // 1 h edge
// Pages whose content is effectively frozen (legal text, contact, forms shell).
// These used to be prerendered at build; they are cached instead so dashboard
// edits to nav/appearance/identity reach them without a rebuild — those edits
// arrive via the global tags' full-zone purge, so the TTL can be long.
export const HTML_TTL_STATIC = "public, max-age=0, s-maxage=2592000"; // 30 d edge
// max-age=0: the browser cache is the one layer no invalidation can reach, so
// admin edits would sit behind it for its full lifetime. Only the edge caches.
//
// API TTLs split by whether the backend can PURGE the endpoint's variants.
//
// STABLE (6 h): endpoints whose only query dimension is ?locale — every
// variant is enumerated by pmone's purge map (config/edge-sites.php, verified
// live in phase 2), so freshness comes from the purge and the TTL is just the
// net. The short 120 s TTL these used to carry was the single biggest CPU
// source left after phase 2: TWO cache layers (Cloudflare's CDN via the zone
// Cache Rule + the in-worker Cache API) both expire on this header, so every
// endpoint × every colo re-ran its full handler (upstream fetch to
// api.pmone.id included) every ≤2 minutes, forever. LOCKSTEP RULE: anything
// listed with API_TTL_STABLE must stay covered by a purge tag in pmone's
// config/edge-sites.php.
export const API_TTL_STABLE = "public, max-age=0, s-maxage=21600";
// VARIED (120 s): endpoints with query dimensions purge cannot enumerate
// (?page, ?search, ?placement, ?per_page, ?fallback…). The TTL is their only
// freshness bound, so it must stay short.
export const API_TTL = "public, max-age=0, s-maxage=120";
// Per-visitor-adjacent or fast-toggle endpoints (forms shell).
export const API_TTL_SHORT = "public, max-age=0, s-maxage=60";
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
  "/tickets": HTML_TTL_LIVE,
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
  // Detail pages — see HTML_TTL_DETAIL for why these are a week and not an hour.
  "/news/": HTML_TTL_DETAIL,
  "/brands/": HTML_TTL_DETAIL,
  "/guests/": HTML_TTL_DETAIL,
  // Public forms, mirroring pmone.id/f/{slug}. The SSR shell is identical for
  // every visitor — prefill, duplicate check and label translation all happen
  // client-side after mount — so edge-caching it is safe like /news/*. The page
  // opts out of the locale prefix, so there is only ever one variant per slug.
  "/f/": HTML_TTL,
};

// Exact-path global rules (no locale expansion): public GET API proxies +
// crawler infra. Cloudflare's cache key includes the query string, so
// query-varied endpoints (?placement, ?locale, ?page) cache per-variant.
export const CACHED_GLOBAL_EXACT: Record<string, string> = {
  // STABLE tier — sole query dimension is ?locale, every variant purge-covered
  // (pmone tags: events, faqs, gallery, guests, media-coverages, partners,
  // programs, rundown, projects/global). See API_TTL_STABLE.
  "/api/editions": API_TTL_STABLE,
  "/api/event/active": API_TTL_STABLE,
  "/api/event/faq": API_TTL_STABLE,
  "/api/event/gallery": API_TTL_STABLE,
  "/api/event/guests": API_TTL_STABLE,
  "/api/event/media-coverage": API_TTL_STABLE,
  "/api/event/partners": API_TTL_STABLE,
  "/api/event/programs": API_TTL_STABLE,
  "/api/event/rundown": API_TTL_STABLE,
  "/api/event/website-settings": API_TTL_STABLE,
  "/api/project/profile": API_TTL_STABLE,

  // VARIED tier — ?page/?search/?placement/?fallback… not purge-enumerable.
  "/api/banners": API_TTL,
  "/api/blog/posts": API_TTL,
  "/api/exhibitors": API_TTL,

  "/robots.txt": "public, max-age=3600, s-maxage=21600",
  "/sitemap_index.xml": "public, max-age=600, s-maxage=3600",
  "/sitemap.xml": "public, max-age=600, s-maxage=3600",
};

// Prefix global rules.
export const CACHED_GLOBAL_PREFIX: Record<string, string> = {
  // Slug-/edition-scoped detail lookups: the purge tags enumerate only the
  // BARE endpoint's locale variants, not per-slug paths — so these must stay on
  // the short tier or an edited guest/rundown would serve 6-hour-stale JSON.
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

  // Strip one locale prefix for HTML matching.
  let path = pathname;
  const seg = path.split("/")[1];
  if (seg && LOCALE_CODES.includes(seg)) {
    path = path.slice(seg.length + 1) || "/";
  }
  if (path === "/") {
    // Locale homepages ("/id", "/zh", …) are cacheable — their locale is in the
    // path, so one stored copy is correct for everyone who asks for it.
    //
    // Bare "/" is NOT, and must stay that way. `detectBrowserLanguage` with
    // `alwaysRedirect` negotiates that response from the `i18n_locale` cookie
    // and then `Accept-Language`, so a single shared copy would hand English
    // HTML to a visitor who should have been redirected to /id — and hand a
    // cached `302 -> /id` to Googlebot, which is what de-indexed all 16 sites
    // in late July 2026. The old in-Worker cache made "/" cacheable by encoding
    // both negotiation inputs into its key; the CDN has no such key, and it
    // does not vary on Accept-Language. Nothing here may cache "/".
    return pathname === "/" ? undefined : HTML_TTL;
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
