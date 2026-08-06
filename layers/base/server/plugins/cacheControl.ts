import { resolveCacheControl } from "../../shared/cf-cache-rules";

/**
 * One job: put `cache-control: public, max-age=0, s-maxage=N` on cacheable 200
 * GET responses, so the zone's "Respect origin Cache-Control" Cache Rule can
 * store them at the Cloudflare edge.
 *
 * That rule is the only cache in front of the Worker now. An in-Worker
 * Cache API layer used to live here as well (own key builder, bot-variant
 * collapse, cached 404s, a monkey-patched `res.end` to catch the `/` redirect).
 * It was removed on 2026-08-06: it saved roughly $5-6/month while poisoning the
 * shared bot cache key with locale redirects, caching transient 404s for an
 * hour, and stripping `set-cookie` from every render — which killed locale
 * stickiness. Declarative headers keep most of the win with none of that.
 *
 * Precedence for `cache-control`, in order:
 *   1. A handler that says `no-store` or `private` — never overridden. This is
 *      the opt-out for per-visitor bodies (today only
 *      /api/forms/[slug]/check, which sits under the cacheable /api/forms/
 *      prefix).
 *   2. layers/base/shared/cf-cache-rules.ts — the table wins over whatever a
 *      handler set, so the 14 routes built on
 *      `defineCachedEventHandler({ maxAge: 15 })` cannot cap the edge TTL at
 *      15 s. That 15 s window is an origin-side burst guard; the edge window is
 *      governed here and invalidated by PM One's purge job on publish.
 *   3. Unlisted routes — left untouched.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("beforeResponse", (event) => {
    if (event.method !== "GET" || getResponseStatus(event) !== 200) {
      return;
    }

    const existing = String(getResponseHeader(event, "cache-control") ?? "");
    if (/no-store|private/i.test(existing)) {
      return;
    }

    const cacheControl = resolveCacheControl(event.path.split("?")[0]);
    if (cacheControl) {
      setResponseHeader(event, "cache-control", cacheControl);
      stripSetCookie(event);
    }
  });
});

/**
 * Drop `set-cookie` from a response the tables say is cacheable.
 *
 * Cloudflare's CDN refuses to store any response carrying Set-Cookie, and
 * @nuxtjs/i18n attaches `i18n_locale` to every HTML render
 * (detectBrowserLanguage.useCookie). Without this, "cacheable" is a lie: every
 * HTML page would be re-rendered for every visitor in every colo, which is the
 * whole cost this layer exists to avoid.
 *
 * Losing the cookie here is safe for the response itself — on a cacheable URL
 * the locale is already in the path, or the route is locale-agnostic. What it
 * used to break was STICKINESS: a visitor who landed on /id/news/x never
 * received `i18n_locale`, so a later visit to bare "/" re-negotiated from
 * Accept-Language and could send an Indonesian reader to the English homepage.
 * That is now handled in the browser instead — app/plugins/i18nLocaleCookie
 * .client.ts writes the cookie from the resolved route locale. Cookies written
 * client-side cost the cache nothing.
 *
 * "/" is never cacheable (see resolveCacheControl), so the 302 that negotiates
 * a locale still carries its Set-Cookie untouched.
 *
 * Any NEW per-visitor cookie on a cacheable GET must not rely on this response
 * to deliver it — set it client-side, or take the route out of the TTL tables.
 */
function stripSetCookie(event: any) {
  removeResponseHeader(event, "set-cookie");
}
