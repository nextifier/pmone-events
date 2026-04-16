export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const appConfig = useAppConfig();
  const query = getQuery(event);
  const username =
    appConfig.app.dataSourceUsername || appConfig.app.projectUsername;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const data = await $fetch(
      `${config.public.apiUrl}/api/public/projects/${username}/brands-with-conjunctions`,
      {
        headers: {
          "X-API-Key": config.pmOneApiKey,
          Accept: "application/json",
        },
        query: {
          per_page: query.per_page || 200,
          ...query,
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
      message: error.message || "Failed to fetch brands with conjunctions",
    });
  } finally {
    clearTimeout(timeoutId);
  }
});
