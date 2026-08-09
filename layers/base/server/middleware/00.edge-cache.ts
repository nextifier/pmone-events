import {
  EDGE_BUILD_HEADER,
  EDGE_CACHE_404_ONLY,
  EDGE_CACHE_KEY,
  EDGE_CACHE_STORE_404,
  buildEdgeCacheKey,
  currentBuildId,
  getEdgeCache,
  looksLikePage,
  resolveEdgeTtl,
} from "../utils/edgeCache";

/**
 * Edge-cache lookup. Runs before every route handler (the filename sorts first).
 *
 * On a hit this returns a `Response` straight from the Cloudflare Cache API,
 * which h3 detects (`isWebResponse` → `sendWebResponse`) and sends verbatim,
 * ending the request before Nuxt renders anything. Cost drops from a full SSR
 * (150-350 ms CPU) to a cache read (~3 ms). On a miss it leaves the key on the
 * event for server/plugins/cacheControl.ts to store the rendered response.
 *
 * Everything degrades to a no-op when `caches.default` is absent, so the dev
 * server and any non-Workers preset behave exactly as before.
 *
 * The `x-edge-cache` header (HIT / MISS / SKIP / STALE-BUILD) exists so the
 * whole thing can be verified with `curl -I`, without dashboard access.
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
  // Worker runs, so a /_nuxt request reaching this code is by definition a
  // chunk from an older build (stale service worker, or HTML cached in a
  // browser). Rendering Nuxt's SSR error page for those cost ~3,100 full
  // renders/day when it was last measured; a bare 404 costs nothing and the
  // client-side chunkReload plugin handles recovery.
  if (url.pathname.startsWith("/_nuxt/")) {
    return new Response(null, {
      status: 404,
      headers: { "x-edge-cache": "SKIP" },
    });
  }

  // 404 pages travel a special path that BYPASSES the beforeResponse hook for
  // the original request (verified in workerd): Nuxt's error handler internally
  // localFetch-es `/__nuxt_error?url=<original>&statusCode=404` — an ordinary
  // h3 route whose response IS the branded error page, and whose headers and
  // body are then copied onto the original response. So this is the one place a
  // 404 can be captured: key the INNER render under the ORIGINAL URL, and let
  // the store step save it as a 404. The next visitor to that URL then HITs at
  // the top of this middleware without any render.
  //
  // This is 21% of all Worker invocations across the estate (39,971 over 2.4
  // days, measured 9 Aug 2026) — scanners probing /wp-login.php and friends,
  // plus dead links. The WAF already blocks most scanner patterns outright;
  // this catches what it has no pattern for.
  if (url.pathname === "/__nuxt_error") {
    if (getRequestHeader(event, "x-nuxt-error")) {
      const query = getQuery(event);
      const original = typeof query.url === "string" ? query.url : "";
      const originalPath = original.split("?")[0] ?? "";

      if (Number(query.statusCode) === 404 && looksLikePage(originalPath)) {
        event.context[EDGE_CACHE_KEY] = buildEdgeCacheKey(
          event,
          new URL(original, url.origin),
        );
        event.context[EDGE_CACHE_STORE_404] = true;
      }
    }
    return; // never cache-match /__nuxt_error itself
  }

  // Outside the two cacheable families the 200 is per-visitor or side-effecting
  // (checkout, order status, tracking, form checks) and must never be stored.
  // Its **404** is a different matter — an unknown HTML path renders the full
  // SSR error page — so it still gets a key, flagged 404-only. The store step
  // refuses anything but a 404 under such a key, so a per-visitor 200 can never
  // enter the cache. Publishing content at a formerly-404 URL purges it exactly
  // (every content model declares edgeCachePaths), so a cached 404 cannot mask
  // a fresh page.
  let notFoundOnly = false;
  if (!resolveEdgeTtl(url.pathname)) {
    if (!looksLikePage(url.pathname)) {
      setResponseHeader(event, "x-edge-cache", "SKIP");
      return;
    }
    notFoundOnly = true;
  }

  const key = buildEdgeCacheKey(event, url);

  // A cache read must never be able to break the request: on any error fall
  // through and render normally.
  const hit = await cache.match(key).catch(() => undefined);

  if (hit) {
    // HTML from an older build references /_nuxt chunks that no longer exist;
    // serving it would white-screen the visitor (the iicc incident). Treat it
    // as a miss and let the fresh render overwrite the entry.
    const staleBuild = hit.headers.get(EDGE_BUILD_HEADER) !== currentBuildId(event);

    // Stored 404s are the branded HTML page. A client that did not ask for HTML
    // (curl, API probes — Nuxt answers those with a JSON error) renders fresh
    // instead: a JSON 404 is a cheap serialization, not a page SSR, so
    // correctness costs almost nothing here.
    const wrongFormat =
      hit.status === 404 &&
      !(getRequestHeader(event, "accept") ?? "").includes("text/html");

    if (!staleBuild && !wrongFormat) {
      const headers = new Headers(hit.headers);
      headers.set("x-edge-cache", "HIT");
      return new Response(hit.body, { status: hit.status, headers });
    }

    setResponseHeader(event, "x-edge-cache", staleBuild ? "STALE-BUILD" : "MISS");
  } else {
    setResponseHeader(event, "x-edge-cache", "MISS");
  }

  event.context[EDGE_CACHE_KEY] = key;
  if (notFoundOnly) {
    event.context[EDGE_CACHE_404_ONLY] = true;
  }
});
