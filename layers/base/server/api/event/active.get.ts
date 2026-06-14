export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const appConfig = useAppConfig();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    // Event identity is per-app (its own project), even when brands/blog are
    // sourced from a shared dataSourceUsername (e.g. icf/cokelat -> cbe).
    const username = appConfig.app.projectUsername;
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
});
