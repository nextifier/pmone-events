export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const appConfig = useAppConfig();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Follow the shared data source when set (icf/cokelat -> cbe) so the event
      // header (dates, venue, edition, in-conjunction) matches the borrowed
      // content; apps without a dataSourceUsername use their own project.
      const username =
        appConfig.app.dataSourceUsername || appConfig.app.projectUsername;
      const data = await $fetch(
        `${config.public.apiUrl}/api/public/projects/${username}/events/active`,
        {
          headers: {
            "X-API-Key": config.pmOneApiKey,
            Accept: "application/json",
          },
          signal: controller.signal,
        },
      );

      return data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw createError({
          statusCode: 504,
          message: "Request timeout - API server took too long to respond",
        });
      }
      throw createError({
        statusCode: error.response?.status || 500,
        message: error.message || "Failed to fetch active event",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    name: "api-event-active",
    maxAge: 15,
    swr: true,
    getKey: () => "default",
  },
);
