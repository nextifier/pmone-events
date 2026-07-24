export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const appConfig = useAppConfig();

    // Short timeout: the projectSettings plugin awaits this during SSR of
    // every page, so a PM One outage with a cold cache must not stall
    // renders for long. Errors are not cached - recovery is immediate.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const dataSourceUsername = appConfig.app.dataSourceUsername;
      const projectUsername = appConfig.app.projectUsername;
      const username = dataSourceUsername || projectUsername;

      const headers = {
        "X-API-Key": config.pmOneApiKey,
        Accept: "application/json",
      };

      const response: any = await $fetch(
        `${config.public.apiUrl}/api/public/projects/${username}/website-settings`,
        { headers, signal: controller.signal },
      );

      // Sites that draw their CONTENT from another project
      // (dataSourceUsername, e.g. cokelatexpo/icf sharing "cbe" = Cafe &
      // Brasserie Expo) must still resolve their ANALYTICS from their OWN
      // project so each co-located site tracks to its own GA4/pixels instead
      // of the shared data-source project's. Override just the analytics block;
      // nav/identity/home sections stay inherited from the data source. Fail
      // open to null - the app then uses its baked nuxt.config gtag id - so a
      // hiccup on this second call never mis-attributes to the wrong property.
      if (
        dataSourceUsername &&
        projectUsername &&
        dataSourceUsername !== projectUsername &&
        response?.data?.settings?.site_config
      ) {
        try {
          const own: any = await $fetch(
            `${config.public.apiUrl}/api/public/projects/${projectUsername}/website-settings`,
            { headers, signal: controller.signal },
          );
          response.data.settings.site_config.analytics =
            own?.data?.settings?.site_config?.analytics ?? null;
        } catch {
          response.data.settings.site_config.analytics = null;
        }
      }

      return response;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw createError({
          statusCode: 504,
          message: "Request timeout - API server took too long to respond",
        });
      }
      throw createError({
        statusCode: error.response?.status || 500,
        message: error.message || "Failed to fetch website settings",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    name: "api-website-settings",
    // Shorter than the other API handlers (300s): this payload drives the
    // home-page section toggles admins expect to see propagate quickly.
    maxAge: 15,
    // NOT swr. A stale payload here fossilises: SSR renders the old data into
    // HTML that is then edge-cached for days. See cf-cache-rules.ts.
    swr: false,
    // Deliberately NOT keyed per-locale: this route (and the upstream PM One
    // endpoint it proxies) is locale-agnostic by design - see
    // useProjectSettingsData.js's docblock. `site_config.copy` (plan 012),
    // the one locale-dependent sub-key, carries every saved locale in a
    // single response instead of needing a per-locale cache entry here.
    getKey: () => "default",
  },
);
