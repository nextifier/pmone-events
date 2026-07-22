import { resolveCacheControl } from "../../shared/cf-cache-rules";
import { EDGE_CACHE_KEY, buildEdgeCacheKey, getEdgeCache } from "../utils/edgeCache";

/**
 * Edge-cache lookup. Runs before every route handler (filename sorts first).
 *
 * On a hit this returns a `Response` straight from the Cloudflare Cache API,
 * which h3 detects (`isWebResponse` -> `sendWebResponse`) and sends verbatim,
 * ending the request before Nuxt renders anything. Cost drops from a full SSR
 * (150-350 ms CPU) to a cache read (~3 ms). On a miss it leaves the cache key on
 * the event for server/plugins/cacheControl.ts to store the rendered response.
 *
 * Everything here degrades to a no-op when `caches.default` is absent, so the
 * dev server and any non-Workers preset behave exactly as before.
 *
 * The `x-edge-cache` header (HIT / MISS / SKIP) exists so the whole system can
 * be verified with `curl -I` and monitored without dashboard access.
 */
export default defineEventHandler(async (event) => {
  if (event.method !== "GET") {
    return;
  }

  const cache = getEdgeCache();
  if (!cache) {
    return;
  }

  const url = getRequestURL(event);

  // Routes not in the cf-cache-rules tables are per-visitor or side-effecting
  // (checkout, tracking, form checks, "/" with its cookie-dependent i18n
  // redirect). They must never be cached — see resolveCacheControl().
  if (!resolveCacheControl(url.pathname)) {
    setResponseHeader(event, "x-edge-cache", "SKIP");
    return;
  }

  const key = buildEdgeCacheKey(event, url);

  // A cache read must never be able to break the request: on any error fall
  // through and render normally.
  const hit = await cache.match(key).catch(() => undefined);

  if (hit) {
    const headers = new Headers(hit.headers);
    headers.set("x-edge-cache", "HIT");
    return new Response(hit.body, { status: hit.status, headers });
  }

  event.context[EDGE_CACHE_KEY] = key;
  setResponseHeader(event, "x-edge-cache", "MISS");
});
