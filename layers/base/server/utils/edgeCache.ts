import type { H3Event } from "h3";
import { LOCALE_CODES } from "../../shared/cf-cache-rules";

/**
 * Shared helpers for the in-worker edge cache (Cloudflare Cache API).
 *
 * WHY THIS EXISTS: on the `cloudflare_module` preset a Worker runs BEFORE
 * Cloudflare's cache, so a zone Cache Rule can never cache a Worker-generated
 * response — it only governs the `fetch()` subrequests a Worker makes, and Nuxt
 * renders in-process without any origin fetch. The tell is that Worker
 * responses carry no `cf-cache-status` header at all while static assets show
 * `cf-cache-status: HIT`. Under the old `cloudflare-pages` preset the Pages
 * project acted as an origin and the Cache Rule did work; the 21 Jul 2026
 * migration silently removed every bit of HTML edge caching and pushed CPU from
 * 84 ms to 145 ms per request.
 *
 * `caches.default` IS the same zone cache, so entries written here are still
 * removable with an ordinary purge-by-URL call — no Enterprise plan needed.
 * That is what lets the PM One dashboard invalidate content on publish.
 *
 * See docs/cf-cpu-investigation-2026-07.md for the full measurement.
 */

/** Cookie written by @nuxtjs/color-mode (`colorMode.storageKey`). */
const COLOR_MODE_COOKIE = "events-color-mode";

/** Cookie written by @nuxtjs/i18n (`detectBrowserLanguage.cookieKey`). */
const LOCALE_COOKIE = "i18n_locale";

/**
 * Marks the cache key on the event so the `cacheControl` server plugin knows
 * this response is worth storing once its body exists.
 */
export const EDGE_CACHE_KEY = "__edgeCacheKey";

/**
 * The Cloudflare Cache API, or null when unavailable (dev server, `nuxi
 * preview`, node preset, tests). Every caller must treat null as "do nothing" —
 * that is what keeps this whole feature a no-op outside Workers.
 */
export function getEdgeCache(): Cache | null {
  const caches = (globalThis as any).caches;
  return caches?.default ?? null;
}

/**
 * Build the cache key for a request.
 *
 * The key is a real URL on the site's own origin (not a synthetic one) so the
 * backend can purge it by URL with the plain `purge_cache` API.
 *
 * `__cm` disambiguates the colour-mode variants: @nuxtjs/color-mode stores the
 * preference in a cookie and SSR stamps it onto `<html class="dark|light">`, so
 * the HTML genuinely differs per visitor. Without this a dark-mode visitor
 * could pin the cache and every light-mode visitor would get dark HTML. JSON
 * API responses never vary this way, so they keep a clean key and a single
 * cache entry.
 */
export function buildEdgeCacheKey(event: H3Event, url: URL): Request {
  const keyUrl = new URL(url.toString());

  if (!keyUrl.pathname.startsWith("/api/")) {
    const preference = getCookie(event, COLOR_MODE_COOKIE);
    keyUrl.searchParams.set("__cm", preference === "light" ? "light" : "dark");
  }

  // "/" is the one route whose response is negotiated rather than determined by
  // its path: @nuxtjs/i18n's detectBrowserLanguage reads the i18n_locale cookie,
  // falls back to Accept-Language, and either renders the default locale or
  // redirects. Both inputs therefore belong in the key.
  //
  // Note this does NOT reimplement i18n's matching — that would rot silently as
  // the module changes. It records the inputs, so any two requests sharing a key
  // handed i18n identical information and cannot have produced different output.
  if (keyUrl.pathname === "/") {
    keyUrl.searchParams.set("__lc", getCookie(event, LOCALE_COOKIE) ?? "none");
    keyUrl.searchParams.set("__al", normalizeAcceptLanguage(event));
  }

  return new Request(keyUrl.toString(), { method: "GET" });
}

/**
 * Reduce Accept-Language to the ordered list of languages this app actually
 * has, e.g. "en-US,en;q=0.9,id;q=0.8,fr;q=0.7" -> "en,id".
 *
 * Hashing the raw header would also be correct but explodes the number of cache
 * entries, since browsers send hundreds of distinct strings. Dropping q-values,
 * region subtags and unknown languages collapses that variety without losing
 * anything i18n consults: it matches by language subtag, in header order,
 * against the configured locales.
 */
function normalizeAcceptLanguage(event: H3Event): string {
  const header = getRequestHeader(event, "accept-language");
  if (!header) {
    return "none";
  }

  const seen: string[] = [];

  for (const part of header.split(",")) {
    const tag = part.trim().split(";")[0]?.trim().toLowerCase();
    const language = tag?.split("-")[0];

    if (language && LOCALE_CODES.includes(language) && !seen.includes(language)) {
      seen.push(language);
    }
  }

  return seen.length ? seen.join(",") : "other";
}
