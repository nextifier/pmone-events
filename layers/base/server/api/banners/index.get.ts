/**
 * Public banners listing for the current event website.
 *
 * Adapter route: like the hotels adapter, each event site must only ever surface
 * the banners that belong to its own project. We force `project_slug` from the
 * app config so the `<BannerHero />` component can stay identical across repos
 * while still being correctly project-scoped here.
 */
export default defineCachedEventHandler(
  async (event) => {
    const appConfig = useAppConfig();
    const username =
      appConfig.app.dataSourceUsername || appConfig.app.projectUsername;

    return await pmOnePublicFetch("/banners", {
      // `placement` is the only key callers vary. Keeping the list closed also
      // bounds getKey() below, which used to hash the WHOLE client query and so
      // minted a cache entry for any string a visitor appended.
      query: { placement: getQuery(event).placement, project_slug: username },
      allowedQueryKeys: ["placement", "project_slug"],
      errorPrefix: "Banners fetch",
    });
  },
  {
    name: "api-banners",
    maxAge: 15,
    // NOT swr. A stale payload here fossilises: SSR renders the old data into
    // HTML that is then edge-cached for days. See cf-cache-rules.ts.
    swr: false,
    // Upstream defaults to the "hero" placement when the key is absent, so an
    // absent placement and placement=hero must share one entry.
    getKey: (event) => `p:${(getQuery(event).placement as string) || "hero"}`,
  },
);
