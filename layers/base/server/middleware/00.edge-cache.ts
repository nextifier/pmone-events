import { resolveCacheControl } from "../../shared/cf-cache-rules";
import {
  EDGE_BUILD_HEADER,
  EDGE_CACHE_404_ONLY,
  EDGE_CACHE_KEY,
  EDGE_CACHE_STORE_404,
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

  // 404 pages travel a special path that BYPASSES the beforeResponse hook for
  // the original request (verified in workerd): Nuxt's error handler internally
  // localFetch-es `/__nuxt_error?url=<original>&statusCode=404` — a normal h3
  // route whose response IS the branded error page, and whose headers/body get
  // copied onto the original response. So this is the one place a 404 can be
  // captured: key the INNER render under the ORIGINAL URL, and the store step
  // saves it as a 404. The next visitor to that URL then HITs at the top of
  // this middleware without any render (~2,400 full error-SSRs/day measured).
  if (url.pathname === "/__nuxt_error") {
    if (getRequestHeader(event, "x-nuxt-error")) {
      const q = getQuery(event);
      const original = typeof q.url === "string" ? q.url : "";
      const origPath = original.split("?")[0] ?? "";
      if (
        Number(q.statusCode) === 404 &&
        origPath.startsWith("/") &&
        isHtmlPath(origPath) &&
        !/\.[a-z0-9]{2,5}$/i.test(origPath) &&
        !origPath.startsWith("/cdn-cgi/")
      ) {
        event.context[EDGE_CACHE_KEY] = buildEdgeCacheKey(
          event,
          new URL(original, url.origin),
        );
        event.context[EDGE_CACHE_STORE_404] = true;
      }
    }
    return; // never cache-match /__nuxt_error itself
  }

  // Routes not in the cf-cache-rules tables are per-visitor or side-effecting
  // (checkout, tracking, form checks) and must never have their 200s cached.
  // But their **404s** are a different matter: an unknown HTML path renders
  // Nuxt's full SSR error page (~2,400 times/day measured — dead links, old
  // sitemaps, misc bots the WAF has no pattern for). Those get a key too,
  // flagged 404-only: the store step will refuse anything but a 404 for them,
  // so a per-visitor 200 still can never enter the cache. Publishing content
  // at a formerly-404 URL purges it exactly (every content model declares
  // edgeCachePaths), so a cached 404 cannot mask a fresh page.
  let notFoundOnly = false;
  if (!resolveCacheControl(url.pathname)) {
    const htmlish =
      isHtmlPath(url.pathname) &&
      !/\.[a-z0-9]{2,5}$/i.test(url.pathname) &&
      !url.pathname.startsWith("/cdn-cgi/");
    if (!htmlish) {
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
    // as a miss and let the fresh render overwrite the entry. API/OG bodies
    // embed no chunk URLs, so they stay valid across deploys and keep their
    // warmth — that asymmetry is deliberate.
    const staleBuild =
      isHtmlPath(url.pathname) &&
      hit.headers.get(EDGE_BUILD_HEADER) !== currentBuildId(event);

    // Stored 404s are the branded HTML page. A client that did not ask for
    // HTML (curl, API probes — Nuxt answers those with a JSON error) renders
    // fresh instead: a JSON 404 is a cheap serialization, not a page SSR, so
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
