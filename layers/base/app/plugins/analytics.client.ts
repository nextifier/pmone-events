/**
 * Initializes GA4 and the TikTok pixel from the dashboard-managed
 * `site_config.analytics` block (PM One plan 009), falling back to each
 * app's baked nuxt-gtag id / `app.config` `tiktokPixelId` when the dashboard
 * has not configured a value - fail-open, per `docs/site-config-contract.md`
 * rule 2.
 *
 * Deferred to the `app:mounted` hook (not run inline in `setup()`, mirroring
 * `hashScroll.client.ts` / `appearanceStylePrune.client.ts`) so this always
 * runs *after* every other client plugin has finished, specifically:
 *
 * - nuxt-gtag's own module-registered boot plugin
 *   (`node_modules/nuxt-gtag/dist/runtime/plugin.client.js`), which - even
 *   under `initMode: "manual"` (layers/base/nuxt.config.ts) - still
 *   unconditionally calls `initGtag()` for any statically-configured (baked)
 *   tag at startup, queuing a `config` command into `window.dataLayer`; only
 *   the `<script>` injection is skipped. If the dashboard GA4 id differs
 *   from the baked one, that stale command would otherwise win once the
 *   script loads (the dashboard override would be silently ignored) - see
 *   the override-handling block in `initGa4()`.
 * - any app-specific TikTok pixel bootstrap that predates this plugin (e.g.
 *   `apps/morefood/app/plugins/tiktok-pixel.client.js`, which has no
 *   idempotency guard of its own), so the `window.ttq` presence check in
 *   `initTikTokPixel()` reliably detects it and this plugin never injects a
 *   second pixel load / duplicate pageview for that app. (That app keeps
 *   tracking via its own legacy plugin; it does not yet gain the dashboard
 *   override for TikTok until that plugin is retired - out of scope here.)
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
    try {
      initGa4();
    } catch {
      /* third-party analytics must never break the app */
    }
    try {
      initTikTokPixel(nuxtApp);
    } catch {
      /* third-party analytics must never break the app */
    }
  });
});

function initGa4(): void {
  const siteConfig = useSiteConfig();
  const gtagOptions = useRuntimeConfig().public.gtag as
    | { id?: string; tags?: Array<string | { id?: string }> }
    | undefined;

  const firstTag = gtagOptions?.tags?.[0];
  const bakedGa4 =
    gtagOptions?.id ||
    (typeof firstTag === "string" ? firstTag : firstTag?.id) ||
    null;

  const ga4 = siteConfig.analytics?.ga4 || bakedGa4 || null;
  if (!ga4) {
    return;
  }

  const { gtag, initialize } = useGtag();

  if (bakedGa4 && ga4 !== bakedGa4 && Array.isArray((window as any).dataLayer)) {
    // Dashboard override differs from the baked id: drop the stale `config`
    // command nuxt-gtag already queued for the baked id at boot, then push
    // the resolved id ourselves. Scoped to just that one entry (not a full
    // dataLayer reset) so a second static tag some apps ship - e.g. flei's
    // Google Ads `AW-16673311348` alongside its GA4 id - is left untouched.
    (window as any).dataLayer = (window as any).dataLayer.filter(
      (entry: any) => !(entry?.[0] === "config" && entry?.[1] === bakedGa4),
    );
    gtag("config", ga4, {});
  }

  // `initialize()` is a no-op past this point for the id-already-queued
  // case above (dataLayer already has the right `config` command); its own
  // `document.head.querySelector('script[data-gtag]')` guard still ensures
  // the gtag.js `<script>` is only ever injected once.
  initialize(ga4);
}

function initTikTokPixel(nuxtApp: ReturnType<typeof useNuxtApp>): void {
  if ((window as any).ttq) {
    return; // already loaded by another plugin - do not inject a second pixel
  }

  const siteConfig = useSiteConfig();
  const appConfig = useAppConfig();

  const raw = siteConfig.analytics?.tiktok_pixel || appConfig.settings?.tiktokPixelId;
  const pixelIds = ([] as string[]).concat(raw as string | string[]).filter(Boolean);
  if (!pixelIds.length) {
    return;
  }

  // Standard TikTok pixel bootstrap (verbatim from TikTok's own snippet -
  // mirrors apps/morefood/app/plugins/tiktok-pixel.client.js, the one
  // existing per-app copy of this code).
  const w = window as any;
  const d = document;
  const t = "ttq";

  w.TiktokAnalyticsObject = t;
  const ttq = (w[t] = w[t] || []);
  ttq.methods = [
    "page",
    "track",
    "identify",
    "instances",
    "debug",
    "on",
    "off",
    "once",
    "ready",
    "alias",
    "group",
    "enableCookie",
    "disableCookie",
    "holdConsent",
    "revokeConsent",
    "grantConsent",
  ];
  ttq.setAndDefer = function (target: any, method: string) {
    target[method] = function (...args: unknown[]) {
      target.push([method].concat(args));
    };
  };
  for (const method of ttq.methods) {
    ttq.setAndDefer(ttq, method);
  }
  ttq.instance = function (id: string) {
    const instance = ttq._i[id] || [];
    for (const method of ttq.methods) {
      ttq.setAndDefer(instance, method);
    }
    return instance;
  };
  ttq.load = function (id: string, config?: Record<string, unknown>) {
    const src = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i = ttq._i || {};
    ttq._i[id] = [];
    ttq._i[id]._u = src;
    ttq._t = ttq._t || {};
    ttq._t[id] = Date.now();
    ttq._o = ttq._o || {};
    ttq._o[id] = config || {};
    const script = d.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `${src}?sdkid=${id}&lib=${t}`;
    const first = d.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(script, first);
  };

  for (const id of pixelIds) {
    ttq.load(id);
  }
  ttq.page();

  // SPA route changes: gtag.js tracks these itself via GA4 Enhanced
  // Measurement, but the TikTok pixel needs an explicit re-fire per
  // navigation (mirrors the legacy per-app plugin's page:finish hook).
  nuxtApp.hook("page:finish", () => {
    ttq.page();
  });
}
