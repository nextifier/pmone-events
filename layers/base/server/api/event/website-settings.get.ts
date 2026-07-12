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
      const username =
        appConfig.app.dataSourceUsername || appConfig.app.projectUsername;

      const headers = {
        "X-API-Key": config.pmOneApiKey,
        Accept: "application/json",
      };

      const response = await $fetch(
        `${config.public.apiUrl}/api/public/projects/${username}/website-settings`,
        { headers, signal: controller.signal },
      );

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
    maxAge: 60,
    swr: true,
    // Deliberately NOT keyed per-locale: this route (and the upstream PM One
    // endpoint it proxies) is locale-agnostic by design - see
    // useProjectSettingsData.js's docblock. `site_config.copy` (plan 012),
    // the one locale-dependent sub-key, carries every saved locale in a
    // single response instead of needing a per-locale cache entry here.
    getKey: () => "default",
  },
);
