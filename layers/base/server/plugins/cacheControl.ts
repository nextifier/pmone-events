import { resolveCacheControl } from "../../shared/cf-cache-rules";

/**
 * Sets `cache-control: public, s-maxage=N` on cacheable 200 GET responses so
 * the per-zone Cloudflare Cache Rule ("Eligible for cache / Edge TTL: use
 * cache-control header if present, bypass if not") lets the edge absorb
 * repeat hits instead of re-running the Worker. See
 * layers/base/shared/cf-cache-rules.ts for the tables + rationale.
 *
 * Deliberately status-200-only: 404s under /news/**, i18n 302s on "/", and
 * error responses are never edge-cached. Responses that already carry a
 * cache-control header (e.g. nuxt-og-image's /_og routes) are left alone.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("beforeResponse", (event) => {
    if (event.method !== "GET") {
      return;
    }
    if (getResponseStatus(event) !== 200) {
      return;
    }
    if (getResponseHeader(event, "cache-control")) {
      return;
    }
    const pathname = event.path.split("?")[0];
    const cacheControl = resolveCacheControl(pathname);
    if (cacheControl) {
      setResponseHeader(event, "cache-control", cacheControl);
    }
  });
});
