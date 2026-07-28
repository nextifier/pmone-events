import { resolveCacheControl } from "../../shared/cf-cache-rules";
import {
  EDGE_BUILD_HEADER,
  EDGE_CACHE_404_ONLY,
  EDGE_CACHE_KEY,
  EDGE_CACHE_STORE_404,
  NOT_FOUND_TTL,
  currentBuildId,
  getEdgeCache,
} from "../utils/edgeCache";

/**
 * Three jobs, all on `beforeResponse`:
 *
 * 1. Set `cache-control: public, s-maxage=N` on cacheable 200 GET responses.
 *    That header is what gives the stored entry its edge TTL.
 * 2. Drop `set-cookie` from those same responses, so the CDN in front of the
 *    Worker is allowed to store them (see stripSetCookie).
 * 3. Store the response in the Cloudflare Cache API under the key
 *    server/middleware/00.edge-cache.ts left on the event, so the next request
 *    for the same URL is served without re-rendering.
 *
 * Step 2 is the part that actually cuts the bill. A zone Cache Rule cannot do
 * this on the Workers preset — the Worker runs before the cache — so caching has
 * to happen inside the Worker. See server/utils/edgeCache.ts for the full why.
 *
 * Status rules: 200s are stored for routes in the cf-cache tables; **404 HTML**
 * is stored for one hour regardless of table membership (each unknown path
 * rendered Nuxt's full SSR error page ~2,400×/day). Redirects and every other
 * error status are never cached. A key flagged 404-only can never store a 200 —
 * that is what keeps per-visitor pages (checkout, order status) out of the
 * cache even though their 404s are cacheable.
 *
 * Precedence for `cache-control`, in order:
 *   1. A handler that says `no-store` or `private` — never cached, never
 *      overridden. This is the opt-out for per-visitor bodies.
 *   2. layers/base/shared/cf-cache-rules.ts — the table wins over whatever a
 *      handler set, so Nitro's short `defineCachedEventHandler` windows cannot
 *      cap the edge TTL.
 *   3. Unlisted routes — left untouched; only their 404s are stored.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("beforeResponse", async (event, response) => {
    if (event.method !== "GET") {
      return;
    }

    // The inner `/__nuxt_error` render (see the middleware) responds 200-shaped
    // but its body IS the branded 404 page for the original URL. Store it as a
    // 404 under that URL's key so the next visitor HITs without any render.
    // The response actually sent keeps its own headers; NOT_FOUND_TTL only
    // governs the stored copy.
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
    // an ordinary handler response — so it lands here with status 404 (no
    // /__nuxt_error round trip; verified in workerd). Store it under the key
    // the middleware built. IMPORTANT: html-ness is judged from the body, not
    // the content-type header — h3 only sets content-type at send time, AFTER
    // this hook, and requiring it here silently disabled 404 caching once
    // already.
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

    // A 404-only key must never admit a 200 — the route is per-visitor or
    // otherwise uncacheable (that is why it is not in the tables).
    if (event.context[EDGE_CACHE_404_ONLY]) {
      delete event.context[EDGE_CACHE_KEY];
      return;
    }

    const existing = String(getResponseHeader(event, "cache-control") ?? "");

    // A handler that opts out wins, always. Exactly one route does this today —
    // /api/forms/[slug]/check sets `private, no-store` because its body is
    // per-visitor — and it sits under the cacheable `/api/forms/` prefix, so
    // without this guard the table below would edge-cache one visitor's answer
    // and serve it to everyone. Any new per-visitor GET must do the same.
    if (/no-store|private/i.test(existing)) {
      delete event.context[EDGE_CACHE_KEY];
      setResponseHeader(event, "x-edge-cache", "SKIP");
      return;
    }

    const pathname = event.path.split("?")[0];
    const cacheControl = resolveCacheControl(pathname);

    // The table OVERRIDES a handler's own header. This matters: the 14 routes
    // built on `defineCachedEventHandler({ maxAge: 15 })` emit
    // `s-maxage=15`, which would cap the edge at 15 s and make the API side of
    // this whole effort pointless. Nitro's 15 s window is an origin-side
    // guard against bursts; the edge window is governed here and invalidated
    // by the dashboard on publish, so it is safe for it to be much longer.
    if (cacheControl) {
      setResponseHeader(event, "cache-control", cacheControl);
      stripSetCookie(event);
    }

    storeInEdgeCache(event, response);
  });
});

/**
 * Strip every `set-cookie` from a response the tables say is cacheable.
 *
 * There are TWO caches in front of a visitor: Cloudflare's CDN (per-zone Cache
 * Rule) and our own Cache API copy inside the Worker. The CDN refuses to store
 * any response carrying Set-Cookie, and @nuxtjs/i18n attaches `i18n_locale` to
 * every HTML render (nuxt.config.ts `detectBrowserLanguage.useCookie`). So a
 * fresh render — the expensive one, 150-350 ms — never reached the CDN; only
 * the cheap second request did, and only in the colo that served it. Cache API
 * is per-colo with no tiering, so every colo paid its own render for the same
 * URL.
 *
 * Dropping the cookie here is the same call storeInEdgeCache already makes on
 * the cached copy, for the same reason: on a cacheable URL the locale is
 * already in the path, or the route is locale-agnostic. What the visitor can
 * observe does not change.
 *
 * What this does NOT touch: the caller returns early on any status other than
 * 200, so the 302 that `/` issues when it negotiates a locale still sets the
 * cookie. That redirect is where the cookie actually earns its keep — verified:
 * `Accept-Language: id` still answers 302 -> /id with `Set-Cookie: i18n_locale`,
 * and a request already carrying the cookie still redirects by it.
 *
 * This removes EVERY Set-Cookie on a cacheable response, not just i18n's. Two
 * exist today and both are safe to lose here:
 *   - `i18n_locale` — see above.
 *   - `brands-view-mode` on /brands, which is only ever the SSR-written default
 *     "grid" (useBrandsListing.js `useCookie(..., { default: () => "grid" })`).
 *     The value falls back to "grid" when absent anyway, and a visitor who
 *     switches to list view has that written by the browser, not by us.
 * Any NEW per-visitor cookie on a cacheable GET must not rely on this response
 * to deliver it — set it client-side, or take the route out of the TTL tables.
 *
 * Accepted trade-off: a visitor landing straight on a locale-prefixed URL no
 * longer receives `i18n_locale`, so a later visit to bare `/` negotiates from
 * Accept-Language instead. A locale picked by hand still sticks — i18n writes
 * that cookie in the browser.
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

  // Only bodies we can reproduce byte-for-byte. Nuxt returns SSR HTML as a
  // string; server API routes return plain objects that h3 JSON-encodes.
  // Anything else (streams, unknown shapes) is left uncached rather than risk
  // serving a corrupted body later.
  const body = response.body;
  let payload: string | Uint8Array;
  let fallbackContentType: string | undefined;

  if (typeof body === "string") {
    payload = body;
  } else if (body instanceof Uint8Array) {
    payload = body;
  } else if (body && typeof body === "object") {
    payload = JSON.stringify(body);
    fallbackContentType = "application/json";
  } else {
    return;
  }

  const headers = new Headers();
  for (const [name, value] of Object.entries(getResponseHeaders(event))) {
    if (value == null) {
      continue;
    }
    headers.set(name, Array.isArray(value) ? value.join(", ") : String(value));
  }

  // The Cache API REFUSES to store a response carrying Set-Cookie. The only one
  // emitted here is @nuxtjs/i18n's `i18n_locale`, and on a cacheable URL the
  // locale is already encoded in the path (or the route is locale-agnostic), so
  // dropping it from the cached copy changes nothing a visitor can observe.
  // "/" is safe too: its cache key carries the exact negotiation inputs, so a
  // HIT would have been offered the same cookie value it already holds.
  headers.delete("set-cookie");
  // Recomputed per request by the middleware; storing it would pin "MISS".
  headers.delete("x-edge-cache");

  if (fallbackContentType && !headers.has("content-type")) {
    headers.set("content-type", fallbackContentType);
  }
  // h3 sets content-type only at send time, after this hook — a stored HTML
  // entry without one would be served as text/plain on HIT.
  if (!headers.has("content-type") && typeof payload === "string") {
    headers.set(
      "content-type",
      status === 404 || /<(!doctype|html)/i.test(payload.slice(0, 200))
        ? "text/html; charset=utf-8"
        : "text/plain; charset=utf-8",
    );
  }

  // Validated on lookup: HTML from an older build is treated as a miss so a
  // deploy can never serve pages referencing deleted /_nuxt chunks. Lives in a
  // header, NOT the key, so the backend's purge-by-URL keeps matching — see
  // EDGE_BUILD_HEADER in server/utils/edgeCache.ts.
  headers.set(EDGE_BUILD_HEADER, currentBuildId(event));

  // For stored 404s: the visitor's copy keeps its own headers (Nuxt sends
  // `no-cache`); this override governs only the edge entry's TTL.
  if (cacheControlOverride) {
    headers.set("cache-control", cacheControlOverride);
  }

  const cached = new Response(payload, { status, headers });

  // Stored 404s are AWAITED by the caller (inner /__nuxt_error renders have no
  // platform waitUntil, so a floating put would be cancelled with the outer
  // request); 200s stay fire-and-forget via waitUntil so visitors never wait.
  const put = cache
    .put(key, cached)
  if (status === 404) {
    return put;
  }
  try {
    event.waitUntil(put);
  } catch {
    // waitUntil unavailable — skip caching rather than break the response.
  }
}
