import { resolveCacheControl } from "../../shared/cf-cache-rules";
import {
  EDGE_BUILD_HEADER,
  EDGE_CACHE_KEY,
  buildEdgeCacheKey,
  currentBuildId,
  getEdgeCache,
  isHtmlPath,
} from "../utils/edgeCache";

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
 * The `x-edge-cache` header (HIT / MISS / SKIP / STALE-BUILD) exists so the
 * whole system can be verified with `curl -I` and monitored without dashboard
 * access.
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

  // Workers Static Assets serves every /_nuxt file that exists BEFORE the
  // worker runs, so a /_nuxt request reaching this code is by definition a
  // chunk from an older build (stale service worker or cached HTML). Rendering
  // Nuxt's SSR error page for those cost ~3,100 full renders/day; a bare 404
  // costs nothing and the client-side chunkReload plugin handles recovery.
  if (url.pathname.startsWith("/_nuxt/")) {
    return new Response(null, {
      status: 404,
      headers: { "x-edge-cache": "SKIP" },
    });
  }

  // Routes not in the cf-cache-rules tables are per-visitor or side-effecting
  // (checkout, tracking, form checks). They must never be cached — see
  // resolveCacheControl().
  if (!resolveCacheControl(url.pathname)) {
    setResponseHeader(event, "x-edge-cache", "SKIP");
    return;
  }

  const key = buildEdgeCacheKey(event, url);

  // A cache read must never be able to break the request: on any error fall
  // through and render normally.
  const hit = await cache.match(key).catch(() => undefined);

  if (hit) {
    // HTML from an older build references /_nuxt chunks that no longer exist;
    // serving it would white-screen the visitor (the iicc incident). Treat it
    // as a miss and let the fresh render overwrite the entry. API/OG bodies
    // embed no chunk URLs, so they stay valid across deploys and keep their
    // warmth — that asymmetry is deliberate.
    const staleBuild =
      isHtmlPath(url.pathname) &&
      hit.headers.get(EDGE_BUILD_HEADER) !== currentBuildId(event);

    if (!staleBuild) {
      const headers = new Headers(hit.headers);
      headers.set("x-edge-cache", "HIT");
      return new Response(hit.body, { status: hit.status, headers });
    }

    setResponseHeader(event, "x-edge-cache", "STALE-BUILD");
  } else {
    setResponseHeader(event, "x-edge-cache", "MISS");
  }

  event.context[EDGE_CACHE_KEY] = key;
});
