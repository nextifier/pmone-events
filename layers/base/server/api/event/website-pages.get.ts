export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const appConfig = useAppConfig();
    const query = getQuery(event);
    const locale = (query.locale as string) || "en";

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
        `${config.public.apiUrl}/api/public/projects/${username}/website-pages`,
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
        message: error.message || "Failed to fetch website pages",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    name: "api-website-pages",
    maxAge: 15,
    // NOT swr. A stale payload here fossilises: SSR renders the old data into
    // HTML that is then edge-cached for days. See cf-cache-rules.ts.
    swr: false,
    getKey: (event) => `l:${(getQuery(event).locale as string) || "en"}`,
  },
);
