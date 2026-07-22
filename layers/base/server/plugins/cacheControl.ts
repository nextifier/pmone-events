import { resolveCacheControl } from "../../shared/cf-cache-rules";
import { EDGE_CACHE_KEY, getEdgeCache } from "../utils/edgeCache";

/**
 * Two jobs, both on `beforeResponse`:
 *
 * 1. Set `cache-control: public, s-maxage=N` on cacheable 200 GET responses.
 *    That header is what gives the stored entry its edge TTL.
 * 2. Store the response in the Cloudflare Cache API under the key
 *    server/middleware/00.edge-cache.ts left on the event, so the next request
 *    for the same URL is served without re-rendering.
 *
 * Step 2 is the part that actually cuts the bill. A zone Cache Rule cannot do
 * this on the Workers preset — the Worker runs before the cache — so caching has
 * to happen inside the Worker. See server/utils/edgeCache.ts for the full why.
 *
 * Deliberately status-200-only: 404s under /news/**, i18n 302s on "/", and
 * error responses are never edge-cached.
 *
 * Precedence for `cache-control`, in order:
 *   1. A handler that says `no-store` or `private` — never cached, never
 *      overridden. This is the opt-out for per-visitor bodies.
 *   2. layers/base/shared/cf-cache-rules.ts — the table wins over whatever a
 *      handler set, so Nitro's short `defineCachedEventHandler` windows cannot
 *      cap the edge TTL.
 *   3. Unlisted routes — left untouched and never stored.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("beforeResponse", (event, response) => {
    if (event.method !== "GET") {
      return;
    }
    if (getResponseStatus(event) !== 200) {
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
    }

    storeInEdgeCache(event, response);
  });
});

/**
 * Copy the outgoing response into the edge cache.
 *
 * Never throws and never blocks the visitor: the write is handed to
 * `event.waitUntil`, and any failure (quota, malformed header, API missing) is
 * swallowed — a failed write just means the next request re-renders.
 */
function storeInEdgeCache(event: any, response: { body?: unknown }) {
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
  // "/" — the one URL whose response really does depend on that cookie — is
  // never cacheable (resolveCacheControl returns undefined for it).
  headers.delete("set-cookie");
  // Recomputed per request by the middleware; storing it would pin "MISS".
  headers.delete("x-edge-cache");

  if (fallbackContentType && !headers.has("content-type")) {
    headers.set("content-type", fallbackContentType);
  }

  const cached = new Response(payload, { status: 200, headers });

  try {
    event.waitUntil(cache.put(key, cached).catch(() => {}));
  } catch {
    // waitUntil unavailable — skip caching rather than break the response.
  }
}
