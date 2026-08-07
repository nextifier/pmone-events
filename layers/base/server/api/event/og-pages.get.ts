export default defineCachedEventHandler(
  async () => {
    // Per-page OG title/description/image overrides (PM One project settings ->
    // SEO) are the ONE thing still managed from the dashboard. Everything else
    // that used to ride the website-settings payload — nav, analytics,
    // appearance, identity, home sections, ticket/blog/book-space toggles —
    // lives in app.config.ts again so every page can be prerendered.
    //
    // The upstream endpoint has no narrower variant, so the response is
    // narrowed HERE. Nothing else can leak back into the frontend by accident.
    const response: any = await pmOneFetch("/website-settings", {
      // 3s at runtime so a PM One outage cannot stall a render; generous during
      // prerender, where the same timeout would bake an OG-less card into every
      // page instead. See server/utils/cacheTtl.ts.
      timeoutMs: API_TIMEOUT_MS,
      errorPrefix: "OG pages fetch",
    });

    return { data: response?.data?.settings?.og_pages ?? {} };
  },
  {
    name: "api-og-pages",
    maxAge: API_MAX_AGE,
    // NOT swr: with SWR the expired entry is served while it revalidates, so
    // the request that triggers the refresh still renders stale data — and a
    // purge landing in that window is undone.
    swr: false,
    // Locale-agnostic: the upstream payload carries every saved locale at once.
    getKey: () => "default",
  },
);
