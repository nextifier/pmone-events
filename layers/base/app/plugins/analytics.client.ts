/**
 * Initializes GA4, the TikTok pixel, the Meta (Facebook) pixel, and Google
 * Tag Manager from the dashboard-managed `site_config.analytics` block (PM
 * One plans 009 + meta_pixel/gtm follow-up), falling back to each app's
 * baked nuxt-gtag id / `app.config` `tiktokPixelId` when the dashboard has
 * not configured a value - fail-open, per `docs/site-config-contract.md`
 * rule 2. The Meta pixel and GTM are new (no legacy baked equivalent), so
 * they simply do nothing when the dashboard has not configured an id - no
 * fallback to resolve.
 *
 * Every id field accepts a single id OR a list of ids (`null | string |
 * string[]`, normalized by `toIds()`): multiple GA4 properties, several Meta
 * or TikTok pixels, and multiple GTM containers all fire together. For GA4 the
 * dashboard list overrides the baked id(s) as a whole (else falls back to the
 * baked GA4 ids); for TikTok the dashboard list overrides the baked pixel(s).
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
 * - any app-specific TikTok pixel bootstrap. morefood's legacy
 *   `tiktok-pixel.client.js` has now been retired so its TikTok pixel flows
 *   through this unified plugin (dashboard `tiktok_pixel` first, baked
 *   `settings.tiktokPixelId` fallback) like every other channel; the
 *   `window.ttq` presence check in `initTikTokPixel()` stays as a defensive
 *   guard so any future per-app pixel bootstrap can never cause a double load.
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
    try {
      initMetaPixel();
    } catch {
      /* third-party analytics must never break the app */
    }
    try {
      initGtm();
    } catch {
      /* third-party analytics must never break the app */
    }
  });
});

/**
 * Normalizes a dashboard analytics value (null | string | string[]) into a
 * clean, de-duplicated list of trimmed non-empty id strings. Every id field
 * supports one or many ids (multi-property GA4, multi-pixel Meta/TikTok,
 * multi-container GTM), so all four init functions route through this.
 */
function toIds(raw: unknown): string[] {
  const list = ([] as unknown[])
    .concat(raw ?? [])
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .map((v) => v.trim());

  return [...new Set(list)];
}

function initGa4(): void {
  const siteConfig = useProjectSiteConfig();
  const gtagOptions = useRuntimeConfig().public.gtag as
    | { id?: string; tags?: Array<string | { id?: string }> }
    | undefined;

  const bakedTagIds = toIds([
    gtagOptions?.id,
    ...(gtagOptions?.tags ?? []).map((t) => (typeof t === "string" ? t : t?.id)),
  ]);
  // Only GA4 measurement ids (G-...) take part in the dashboard override /
  // fallback. Any other statically-configured tag some apps ship - e.g. flei's
  // Google Ads `AW-16673311348` - is left exactly as nuxt-gtag queued it.
  const bakedGa4Ids = bakedTagIds.filter((id) => id.startsWith("G-"));

  const dashboardGa4Ids = toIds(siteConfig.analytics?.ga4);
  const ga4Ids = dashboardGa4Ids.length ? dashboardGa4Ids : bakedGa4Ids;
  if (!ga4Ids.length) {
    return;
  }

  const { gtag, initialize } = useGtag();

  if (dashboardGa4Ids.length && Array.isArray((window as any).dataLayer)) {
    // Dashboard overrides the baked GA4 id(s): drop the stale `config` commands
    // nuxt-gtag already queued at boot for baked GA4 ids that are no longer
    // wanted, leaving non-GA4 static tags (Ads etc.) untouched.
    const stale = bakedGa4Ids.filter((id) => !ga4Ids.includes(id));
    if (stale.length) {
      (window as any).dataLayer = (window as any).dataLayer.filter(
        (entry: any) => !(entry?.[0] === "config" && stale.includes(entry?.[1])),
      );
    }
  }

  // Queue a `config` command for every resolved id that nuxt-gtag has not
  // already configured at boot (the baked case) - no double-count.
  const configured = new Set(
    (Array.isArray((window as any).dataLayer) ? (window as any).dataLayer : [])
      .filter((entry: any) => entry?.[0] === "config")
      .map((entry: any) => entry?.[1]),
  );
  for (const id of ga4Ids) {
    if (!configured.has(id)) {
      gtag("config", id, {});
    }
  }

  // Loads the gtag.js `<script>` exactly once (nuxt-gtag's own
  // `script[data-gtag]` guard); a single library load serves every property.
  initialize(ga4Ids[0]);
}

function initTikTokPixel(nuxtApp: ReturnType<typeof useNuxtApp>): void {
  if ((window as any).ttq) {
    return; // already loaded by another plugin - do not inject a second pixel
  }

  const siteConfig = useProjectSiteConfig();
  const appConfig = useAppConfig();

  const dashboardIds = toIds(siteConfig.analytics?.tiktok_pixel);
  const pixelIds = dashboardIds.length
    ? dashboardIds
    : toIds(appConfig.settings?.tiktokPixelId);
  if (!pixelIds.length) {
    return;
  }

  // Standard TikTok pixel bootstrap (verbatim from TikTok's own snippet - this
  // is now the single copy, having replaced morefood's retired per-app plugin).
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

function initMetaPixel(): void {
  const siteConfig = useProjectSiteConfig();
  const pixelIds = toIds(siteConfig.analytics?.meta_pixel);
  if (!pixelIds.length) {
    return; // no baked fallback - new id, absent means do nothing
  }

  // Standard Meta Pixel bootstrap (verbatim from Meta's own snippet). The IIFE
  // self-guards via `if (f.fbq) return`, so it is safe to call even when fbq
  // already exists - Meta supports several pixels via repeated `fbq('init')`.
  (function (f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
    if (f.fbq) {
      return;
    }
    n = f.fbq = function (...args: unknown[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    };
    if (!f._fbq) {
      f._fbq = n;
    }
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  const fbq = (window as any).fbq;
  for (const id of pixelIds) {
    fbq("init", id);
  }
  // A single PageView fans out to every initialized pixel.
  fbq("track", "PageView");
}

function initGtm(): void {
  const siteConfig = useProjectSiteConfig();
  const gtmIds = toIds(siteConfig.analytics?.gtm);
  if (!gtmIds.length) {
    return; // no baked fallback - new id, absent means do nothing
  }

  for (const gtmId of gtmIds) {
    if ((window as any).google_tag_manager?.[gtmId]) {
      continue; // container already loaded - do not inject a second one
    }

    // Standard GTM container bootstrap (verbatim from Google Tag Manager's own
    // snippet). Multiple containers share the one `dataLayer`.
    (function (w: any, d: Document, s: string, l: string, i: string) {
      w[l] = w[l] || [];
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      const f = d.getElementsByTagName(s)[0];
      const j = d.createElement(s) as HTMLScriptElement;
      const dl = l !== "dataLayer" ? `&l=${l}` : "";
      j.async = true;
      j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
      f?.parentNode?.insertBefore(j, f);
    })(window, document, "script", "dataLayer", gtmId);
  }
}
