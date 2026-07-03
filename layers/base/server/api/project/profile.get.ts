export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const appConfig = useAppConfig();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const username =
        appConfig.app.dataSourceUsername || appConfig.app.projectUsername;
      const data = await $fetch(
        `${config.public.apiUrl}/api/public/projects/${username}`,
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
        message: error.message || "Failed to fetch project profile",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    name: "api-project-profile",
    maxAge: 300,
    swr: true,
    getKey: () => "default",
  },
);
