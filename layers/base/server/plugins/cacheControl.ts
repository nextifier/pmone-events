import {
  EDGE_BUILD_HEADER,
  EDGE_CACHE_404_ONLY,
  EDGE_CACHE_KEY,
  EDGE_CACHE_STORE_404,
  NOT_FOUND_TTL,
  currentBuildId,
  getEdgeCache,
  resolveEdgeTtl,
} from "../utils/edgeCache";

/**
 * Three jobs, all on `beforeResponse`:
 *
 * 1. `Cache-Control` for the routes whose own module does not set a usable one.
 * 2. For the edge-cacheable families, stamp the edge TTL and drop `Set-Cookie`,
 *    because the Cache API refuses to store a response carrying one.
 * 3. Store the response under the key server/middleware/00.edge-cache.ts left
 *    on the event, so the next request for that URL is served without
 *    re-rendering.
 *
 * ON s-maxage. Cloudflare's CDN never sees a Worker response — the Worker runs
 * in front of the cache on the `cloudflare_module` preset — so `s-maxage` is
 * NOT read by the CDN. It is read by `caches.default`, the Cache API copy this
 * plugin writes from inside the Worker. That is the only reason an s-maxage
 * appears here at all; see server/utils/edgeCache.ts for the measurement.
 *
 * `max-age` is a separate matter: the visitor's BROWSER honours it regardless
 * of what any cache in between does, which is what the BROWSER_TTL table below
 * is for. The icon endpoint is the one that matters — @nuxt/icon emits
 * `s-maxage` with no `max-age`, so without this override a browser re-fetches
 * every icon collection on every page load, and /api/_nuxt_icon/ is 12% of all
 * Worker invocations.
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

function resolveBrowserCacheControl(pathname: string): string | undefined {
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
  nitroApp.hooks.hook("beforeResponse", async (event, response) => {
    if (event.method !== "GET") {
      return;
    }

    // The inner `/__nuxt_error` render (see the middleware) responds
    // 200-shaped, but its body IS the branded 404 page for the original URL.
    // Store it as a 404 under that URL's key so the next visitor HITs without
    // any render. The response actually sent keeps its own headers;
    // NOT_FOUND_TTL governs only the stored copy.
    //
    // AWAITED, not waitUntil: this hook runs on the INNER localFetch request,
    // whose mock event has no platform waitUntil — an un-awaited cache.put
    // would be cancelled when the outer request finishes. A 404 render is rare
    // (that is the whole point), so blocking it a few extra ms is free.
    if (event.context[EDGE_CACHE_STORE_404]) {
      if (typeof (response as any)?.body === "string") {
        await storeInEdgeCache(event, response, 404, NOT_FOUND_TTL);
      }
      return;
    }

    // Direct 404s: when a page's data fetch throws createError(404), Nuxt
    // renders the branded error page inside the SAME request and returns it as
    // an ordinary handler response — so it lands here with status 404, with no
    // /__nuxt_error round trip. IMPORTANT: html-ness is judged from the body,
    // not the content-type header — h3 only sets content-type at send time,
    // AFTER this hook, and requiring it here silently disabled 404 caching
    // once already.
    if (getResponseStatus(event) === 404) {
      const body = (response as any)?.body;
      if (
        event.context[EDGE_CACHE_KEY] &&
        typeof body === "string" &&
        /<(!doctype|html)/i.test(body.slice(0, 200))
      ) {
        await storeInEdgeCache(event, response, 404, NOT_FOUND_TTL);
      }
      return;
    }

    if (getResponseStatus(event) !== 200) {
      return;
    }

    // A 404-only key must never admit a 200 — that route is per-visitor or
    // otherwise uncacheable, which is why it is outside the cacheable families.
    if (event.context[EDGE_CACHE_404_ONLY]) {
      delete event.context[EDGE_CACHE_KEY];
      return;
    }

    // A handler that opts out wins. /api/forms/[slug]/check sets
    // `private, no-store` because its body is per-visitor; nuxt-robots and
    // @nuxtjs/sitemap set `no-store` in dev. Never override either, and never
    // cache them.
    const existing = String(getResponseHeader(event, "cache-control") ?? "");
    if (/no-store|private/i.test(existing)) {
      delete event.context[EDGE_CACHE_KEY];
      return;
    }

    const pathname = event.path.split("?")[0];
    const edgeTtl = resolveEdgeTtl(pathname);

    if (edgeTtl) {
      setResponseHeader(event, "cache-control", edgeTtl);
      stripSetCookie(event);
      storeInEdgeCache(event, response);
      return;
    }

    const browserTtl = resolveBrowserCacheControl(pathname);
    if (browserTtl) {
      setResponseHeader(event, "cache-control", browserTtl);
    }
  });
});

/**
 * Drop `Set-Cookie` from an edge-cacheable response.
 *
 * The Cache API refuses to store any response carrying one, and @nuxtjs/i18n
 * attaches `i18n_locale` to every HTML render
 * (nuxt.config.ts `detectBrowserLanguage.useCookie`). Without this, a fresh
 * render — the expensive one — could never be stored, and the cache would stay
 * permanently empty. Verified 9 Aug 2026 against production: every /news and
 * /brands response carried `set-cookie: i18n_locale`, and not one of 89,247
 * requests produced a cache hit.
 *
 * On these URLs the locale is already in the path, so nothing a visitor can
 * observe changes. Two cookies exist today and both are safe to lose here:
 *   - `i18n_locale` — see above. A locale picked by hand still sticks, because
 *     i18n writes that cookie in the browser.
 *   - `brands-view-mode` on /brands, which is only ever the SSR-written default
 *     "grid" (useBrandsListing.js `useCookie(..., { default: () => "grid" })`).
 *     It falls back to "grid" when absent, and a visitor who switches to list
 *     view has that written by the browser.
 *
 * Any NEW per-visitor cookie on /news or /brands must not rely on this response
 * to deliver it — set it client-side, or take the route out of resolveEdgeTtl.
 *
 * Untouched elsewhere: the caller returns early on any status but 200, so the
 * 302 that "/" issues when it negotiates a locale still sets the cookie. That
 * redirect is where the cookie actually earns its keep.
 */
function stripSetCookie(event: any) {
  removeResponseHeader(event, "set-cookie");
}

/**
 * Copy the outgoing response into the edge cache.
 *
 * Never throws and never blocks the visitor: the write is handed to
 * `event.waitUntil`, and any failure (quota, malformed header, API missing) is
 * swallowed — a failed write just means the next request re-renders.
 */
function storeInEdgeCache(
  event: any,
  response: { body?: unknown },
  status: 200 | 404 = 200,
  cacheControlOverride?: string,
) {
  const key: Request | undefined = event.context[EDGE_CACHE_KEY];
  if (!key) {
    return;
  }

  const cache = getEdgeCache();
  if (!cache) {
    return;
  }

  // Only bodies reproducible byte-for-byte. Nuxt returns SSR HTML as a string.
  // Anything else (streams, unknown shapes) is left uncached rather than risk
  // serving a corrupted body later.
  const body = response.body;
  if (typeof body !== "string") {
    return;
  }

  const headers = new Headers();
  for (const [name, value] of Object.entries(getResponseHeaders(event))) {
    if (value == null) {
      continue;
    }
    headers.set(name, Array.isArray(value) ? value.join(", ") : String(value));
  }

  // The Cache API REFUSES to store a response carrying Set-Cookie. The 200 path
  // already stripped it; a stored 404 needs the same treatment, and its own
  // response keeps whatever Nuxt sent.
  headers.delete("set-cookie");
  // Recomputed per request by the middleware; storing it would pin "MISS".
  headers.delete("x-edge-cache");

  // h3 sets content-type only at send time, after this hook — a stored HTML
  // entry without one would be served as text/plain on HIT.
  if (!headers.has("content-type")) {
    headers.set("content-type", "text/html; charset=utf-8");
  }

  // Validated on lookup: HTML from an older build is treated as a miss so a
  // deploy can never serve pages referencing deleted /_nuxt chunks. Lives in a
  // header, NOT the key, so the backend's purge-by-URL keeps matching — see
  // EDGE_BUILD_HEADER in server/utils/edgeCache.ts.
  headers.set(EDGE_BUILD_HEADER, currentBuildId(event));

  // For stored 404s the visitor's copy keeps its own headers (Nuxt sends
  // `no-cache`); this override governs only the edge entry's TTL.
  if (cacheControlOverride) {
    headers.set("cache-control", cacheControlOverride);
  }

  const put = cache.put(key, new Response(body, { status, headers })).catch(() => {});

  // Stored 404s are AWAITED by the caller (inner /__nuxt_error renders have no
  // platform waitUntil, so a floating put would be cancelled with the outer
  // request); 200s stay fire-and-forget so visitors never wait.
  if (status === 404) {
    return put;
  }

  try {
    event.waitUntil(put);
  } catch {
    // waitUntil unavailable — skip caching rather than break the response.
  }
}
