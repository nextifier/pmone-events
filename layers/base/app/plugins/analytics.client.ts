/**
 * Initializes GA4, the TikTok pixel, the Meta (Facebook) pixel, and Google Tag
 * Manager. Every id is baked in code: GA4 in each app's nuxt.config `gtag.tags`
 * (nuxt-gtag needs it before hydration), the rest in `app.config.settings`.
 *
 * These were briefly dashboard-managed via `site_config.analytics`; that layer
 * was removed in Aug 2026 with the rest of the website-settings pipeline. A
 * prerendered page cannot carry a runtime-resolved tracking id anyway.
 *
 * Every id field accepts a single id OR a list (`"" | string | string[]`,
 * normalized by `toIds()`): multiple GA4 properties, several Meta or TikTok
 * pixels, and multiple GTM containers all fire together.
 *
 * Deferred to the `app:mounted` hook (not run inline in `setup()`, mirroring
 * `hashScroll.client.ts`) so this always runs after every other client plugin,
 * specifically nuxt-gtag's own boot plugin — which, even under
 * `initMode: "manual"`, queues a `config` command into `window.dataLayer` for
 * every statically-configured tag. `initGa4()` below de-dupes against it.
 *
 * The `window.ttq` presence check in `initTikTokPixel()` is a defensive guard so
 * a future per-app pixel bootstrap can never cause a double load.
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
 * Normalizes a configured analytics value ("" | string | string[]) into a
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
  const gtagOptions = useRuntimeConfig().public.gtag as
    | { id?: string; tags?: Array<string | { id?: string }> }
    | undefined;

  const bakedTagIds = toIds([
    gtagOptions?.id,
    ...(gtagOptions?.tags ?? []).map((t) => (typeof t === "string" ? t : t?.id)),
  ]);
  // Only GA4 measurement ids (G-...) are initialized here. Any other
  // statically-configured tag some apps ship - e.g. flei's Google Ads
  // `AW-16673311348` - is left exactly as nuxt-gtag queued it.
  const ga4Ids = bakedTagIds.filter((id) => id.startsWith("G-"));
  if (!ga4Ids.length) {
    return;
  }

  const { gtag, initialize } = useGtag();

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

  const pixelIds = toIds(useAppConfig().settings?.tiktokPixelId);
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
  const pixelIds = toIds(useAppConfig().settings?.metaPixelId);
  if (!pixelIds.length) {
    return; // unset on every app today - absent means do nothing
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
  const gtmIds = toIds(useAppConfig().settings?.gtmId);
  if (!gtmIds.length) {
    return; // unset on every app today - absent means do nothing
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
