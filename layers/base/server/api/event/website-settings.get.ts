export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const appConfig = useAppConfig();
    const query = getQuery(event);
    const locale = (query.locale as string) || "en";

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
        { headers, query: { locale }, signal: controller.signal },
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
    // Keyed per-locale (plan 012) so site_config.copy resolves the right
    // language server-side, mirroring website-pages.get.ts. Every other
    // sub-key is locale-agnostic, so this only multiplies the cache by the
    // handful of supported locales (~5), not per-page.
    getKey: (event) => `l:${(getQuery(event).locale as string) || "en"}`,
  },
);
