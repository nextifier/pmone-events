import type { H3Event } from "h3";

/**
 * In-worker edge cache (Cloudflare Cache API), scoped to the two route families
 * that actually cost money.
 *
 * WHAT ACTUALLY BLOCKED CACHING, because the file this replaces got it wrong.
 * The old docblock claimed a Worker response can never be cached at all,
 * reasoning that the Worker runs in front of the cache. Half true and the wrong
 * half: the Worker does run first on the way IN, but its response passes back
 * out through the CDN, which stores it whenever it is storable — and then
 * serves later requests without invoking the Worker at all.
 *
 * The thing that made it unstorable was `Set-Cookie`. @nuxtjs/i18n attaches
 * `i18n_locale` to every HTML render, no cache will store a response carrying
 * one, and no `Cache-Control` was set either. Measured 9 Aug 2026 across the
 * estate: 89,247 requests to /news/[slug] + /brands/[slug], zero cache hits,
 * 100% `cacheStatus: none`. After dropping the cookie and setting a public
 * s-maxage, 20 consecutive requests to the hottest article all returned
 * `cf-cache-status: HIT` with a rising `age` — one stored object, no Worker.
 *
 * So this layer buys two separate things. `caches.default` makes the first
 * request in a colo cheap; the storable response makes every request after it
 * free. `caches.default` IS the same zone cache, so entries stay removable with
 * an ordinary purge-by-URL call — that is what lets the PM One dashboard
 * invalidate content on publish (app/Support/EdgeCache.php).
 *
 * WHY IT IS BACK, AND MUCH SMALLER. A general version of this shipped 23 Jul
 * and was removed 6 Aug 2026 (72adf69) — 393 lines plus a 294-line path→TTL
 * table — because its measured value was about a dollar a cycle and the bare
 * "/" route could not safely be cached. Both premises changed. "/" is a
 * prerendered static asset now and never reaches the Worker, so that hazard is
 * gone. And a per-path measurement on 9 Aug put /news/[slug] at 32% of all
 * Worker invocations, /brands/[slug] at 11%, and 404 error pages at 21% —
 * roughly three quarters of the remaining CPU, since an SSR render is
 * 150-350 ms against ~3 ms for a cache read.
 *
 * So this version caches those, and nothing else. No API responses, no OG
 * images, no redirects, no "/" locale negotiation. Every one of those was
 * either cheap, already free, or a source of key-space bugs.
 */

/** Cookie written by @nuxtjs/color-mode (`colorMode.storageKey`). */
const COLOR_MODE_COOKIE = "events-color-mode";

/**
 * Locale prefixes that can appear in a path. `en` is the default locale under
 * i18n's `prefix_except_default`, so it never appears as a segment.
 */
const LOCALE_PREFIXES = new Set(["id", "zh", "ja", "ko"]);

/**
 * Crawlers and preview fetchers, collapsed onto the default variant.
 *
 * Two thirds of HTML traffic is a flat tail of article URLs averaging a dozen
 * hits a day, much of it bots — and the Cache API is per-colo, so every colo
 * pays its own MISS per URL *per variant*. Pinning bots to one variant halves
 * their key space and lets a bot visit pre-warm the entry a human then hits.
 * Safe because a bot never observes the difference: the colour-mode class is
 * cosmetic.
 */
const BOT_UA_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|linkedin|pinterest|petalbot|ahrefs|semrush|mj12|applebot|bytespider|ccbot|amazonbot|gptbot|claude|perplexity|yandex|baidu|duckduck/i;

/**
 * Detail pages, 30 days.
 *
 * Freshness does not come from this number. Publishing or editing purges the
 * exact URL (Post::edgeCachePaths / Brand::edgeCachePaths, expanded across
 * locales and colour-mode variants by EdgeCache::htmlVariants), so the TTL is
 * only the backstop for a purge that failed.
 *
 * It is long because the long tail is the whole problem. Roughly 25,500 detail
 * requests a day spread over ~1,850 article URLs is ~14 hits per article per
 * day, and the cache is per data centre — at one hour, nearly every request is
 * a miss. At 30 days even the quietest article stays warm.
 *
 * WHAT MAKES THIS SAFE. Cached HTML embeds hashed /_nuxt chunk URLs that a
 * deploy replaces. These pages are rendered by the worker, so the
 * `x-edge-build` guard in server/middleware/00.edge-cache.ts covers them:
 * verified 9 Aug 2026 on morefood, cokelatexpo and icf, where a URL warmed
 * before their rebuild came back `x-edge-cache: STALE-BUILD` afterwards and
 * re-rendered with every chunk resolving.
 *
 * The prerendered pages are the ones that guard cannot reach — the Assets
 * binding serves them without invoking the worker at all. PM One's
 * `edge-cache:purge-after-build` covers those by purging a site's zone when its
 * Worker is redeployed. It is a backstop for this TTL too, but not the thing
 * holding it up.
 */
const DETAIL_TTL = "public, max-age=0, s-maxage=2592000";

/**
 * Listings. Shorter, because they change whenever ANY item is published and a
 * purge that misses shows a visibly incomplete list rather than one stale page.
 */
const LISTING_TTL = "public, max-age=0, s-maxage=3600";

/**
 * Cached 404s. Short: this only exists to absorb bot floods and dead links, and
 * publishing at a formerly-404 URL purges it exactly anyway.
 */
export const NOT_FOUND_TTL = "public, max-age=0, s-maxage=3600";

/** Marks the cache key on the event so the store step knows what to write. */
export const EDGE_CACHE_KEY = "__edgeCacheKey";

/**
 * Set alongside EDGE_CACHE_KEY for HTML paths outside the cacheable families:
 * only a 404 may be stored under such a key. This is the guard that lets
 * unknown-path error pages be cached without ever risking a per-visitor 200
 * (checkout, order status, attendee e-tickets) entering the cache.
 */
export const EDGE_CACHE_404_ONLY = "__edgeCache404Only";

/**
 * Set on the INNER `/__nuxt_error` render (see the middleware): its 200-shaped
 * response body is the branded 404 page for the original URL, and must be
 * stored as a 404 under that URL's key.
 */
export const EDGE_CACHE_STORE_404 = "__edgeCacheStore404";

/**
 * Stamped onto every stored entry and validated on lookup.
 *
 * WHY A HEADER AND NOT PART OF THE KEY: purge-by-URL is an exact match
 * including the query string, and the PM One backend can never know the build
 * UUID — so a `__b=<uuid>` key param silently made every dashboard purge a
 * no-op. Discovered 23 Jul 2026, hours after the build id was added to the key.
 * Keeping the key enumerable and validating the build inside the stored entry
 * preserves both properties: a deploy can never serve HTML referencing deleted
 * /_nuxt chunks (the iicc white-screen incident), and the backend can still
 * purge by listing the variants.
 */
export const EDGE_BUILD_HEADER = "x-edge-build";

/** The running build's id — regenerated by Nuxt on every build. */
export function currentBuildId(event: H3Event): string {
  return useRuntimeConfig(event).app?.buildId ?? "dev";
}

/**
 * The Cloudflare Cache API, or null when unavailable (dev server, `nuxi
 * preview`, node preset, tests). Every caller treats null as "do nothing" —
 * that is what keeps this a no-op outside Workers.
 */
export function getEdgeCache(): Cache | null {
  const caches = (globalThis as any).caches;
  return caches?.default ?? null;
}

/** Anything with a file extension is an asset, never a page. */
export function looksLikePage(pathname: string): boolean {
  return (
    pathname.startsWith("/") &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_og/") &&
    !pathname.startsWith("/_nuxt/") &&
    !pathname.startsWith("/cdn-cgi/") &&
    !pathname.startsWith("/__sitemap__/") &&
    !/\.[a-z0-9]{2,5}$/i.test(pathname)
  );
}

/**
 * Strip the leading locale and edition segments so `/id/2025/brands/acme` and
 * `/brands/acme` resolve to the same shape. Both are real URL shapes in this
 * app: i18n prefixes non-default locales, and `pages/[edition]/brands/[slug]`
 * serves previous editions.
 */
function canonicalSegments(pathname: string): string[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] && LOCALE_PREFIXES.has(segments[0])) {
    segments.shift();
  }
  if (segments[0] && /^\d{4}$/.test(segments[0])) {
    segments.shift();
  }

  return segments;
}

/**
 * The edge TTL for a path, or undefined when it must never be cached.
 *
 * Deliberately an allowlist of one route family rather than a table. Every
 * other page is either a prerendered static asset (never reaches the Worker),
 * client-rendered (see below), or per-visitor — checkout, order status, hotel
 * reservations, public forms. A table invites the next person to add a
 * per-visitor route to it by mistake.
 *
 * BRANDS ARE DELIBERATELY ABSENT. They were here until 11 Aug 2026 and earned
 * a 4.5% hit rate against news's 63.9%: thousands of URLs times five locales
 * against a per-data-centre cache is a tail that never warms. They now carry
 * `ssr: false` (see the routeRules block in nuxt.config.ts), so the worker
 * answers them from a shell string memoised for the isolate's lifetime —
 * cheaper than a cache lookup, and identical for every slug, so storing one
 * entry per URL would spend cache storage to save nothing.
 */
export function resolveEdgeTtl(pathname: string): string | undefined {
  if (!looksLikePage(pathname)) {
    return undefined;
  }

  const segments = canonicalSegments(pathname);

  if (segments[0] !== "news") {
    return undefined;
  }
  if (segments.length === 1) {
    return LISTING_TTL;
  }
  if (segments.length === 2) {
    return DETAIL_TTL;
  }

  return undefined;
}

/**
 * Build the cache key for a request.
 *
 * A real URL on the site's own origin (not a synthetic one) so the backend can
 * purge it with the plain `purge_cache` API.
 *
 * `__cm` disambiguates the colour-mode variants: @nuxtjs/color-mode stores the
 * preference in a cookie and SSR stamps it onto `<html class="dark|light">`, so
 * the HTML genuinely differs per visitor. Without it a dark-mode visitor could
 * pin the entry and every light-mode visitor would be served dark HTML.
 *
 * KEEP IN LOCKSTEP with EdgeCache::htmlVariants() in the PM One backend: it
 * purges by listing these exact variants, and a key param the backend does not
 * mirror makes every purge silently match nothing.
 */
export function buildEdgeCacheKey(event: H3Event, url: URL): Request {
  const keyUrl = new URL(url.toString());
  const isBot = BOT_UA_RE.test(getRequestHeader(event, "user-agent") ?? "");
  const preference = isBot ? undefined : getCookie(event, COLOR_MODE_COOKIE);

  keyUrl.searchParams.set("__cm", preference === "light" ? "light" : "dark");

  return new Request(keyUrl.toString(), { method: "GET" });
}
