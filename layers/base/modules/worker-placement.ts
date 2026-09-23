import { defineNuxtModule } from "@nuxt/kit";

/**
 * worker-placement — run each site's Worker next to its API.
 *
 * Prerendered pages are static assets and never touch the Worker, but every
 * SSR route (tickets, checkout, hotels, anything prerender skips) fetches the
 * PM One API from inside the Worker before its first byte. By default that
 * Worker runs at whichever Cloudflare edge the visitor's ISP lands on, and
 * Telkom/IndiHome routes Cloudflare's anycast prefixes to HKG, PDX or MXP about
 * as often as to SIN. From there each fetch crossed the public internet to the
 * Singapore origin, the leg measured at 0.6-50 s per request on 23 Sep 2026
 * while the origin itself answered in 0.1-0.7 s.
 *
 * A `placement.hostname` hint makes Cloudflare HEAD-probe that host and run the
 * Worker at the edge closest to it; the receiving edge forwards the request over
 * Cloudflare's own backbone. Static assets are unaffected, they are always
 * served from the nearest edge.
 *
 * The host is read the way Nitro resolves it (NUXT_PUBLIC_API_URL first, then
 * the app's runtimeConfig.public.apiUrl), because this layer serves more than
 * one instance and must never bake one in. The hint only works for a
 * single-homed, DNS-only host: pointing it at a Cloudflare-proxied (anycast)
 * hostname would probe Cloudflare itself and place nothing.
 */
export default defineNuxtModule({
  meta: { name: "worker-placement" },
  setup(_, nuxt) {
    if (nuxt.options.dev) {
      return;
    }

    nuxt.hook("nitro:config", (nitroConfig) => {
      const configured = (nuxt.options.runtimeConfig as Record<string, any>)?.public?.apiUrl;
      const apiUrl = process.env.NUXT_PUBLIC_API_URL || configured;

      if (!apiUrl) {
        return;
      }

      let hostname: string;
      try {
        hostname = new URL(String(apiUrl)).hostname;
      } catch {
        return;
      }

      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return;
      }

      nitroConfig.cloudflare ||= {};
      nitroConfig.cloudflare.wrangler ||= {};
      nitroConfig.cloudflare.wrangler.placement = { hostname };
    });
  },
});
