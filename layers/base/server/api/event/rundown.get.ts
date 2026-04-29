export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const appConfig = useAppConfig();
  const query = getQuery(event);
  const locale = (query.locale as string) || "en";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const username = appConfig.app.dataSourceUsername || appConfig.app.projectUsername;

    const headers = {
      "X-API-Key": config.pmOneApiKey,
      Accept: "application/json",
    };

    // Resolve the active event slug, then fetch its rundown
    const activeEvent = await $fetch<{ data: { slug: string } }>(
      `${config.public.apiUrl}/api/public/projects/${username}/events/active`,
      { headers, signal: controller.signal },
    );

    const eventSlug = activeEvent?.data?.slug;
    if (!eventSlug) {
      return { data: { days: [] } };
    }

    const rundown = await $fetch(
      `${config.public.apiUrl}/api/public/projects/${username}/events/${eventSlug}/rundown`,
      {
        headers,
        query: { locale },
        signal: controller.signal,
      },
    );

    return rundown;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw createError({
        statusCode: 504,
        message: "Request timeout - API server took too long to respond",
      });
    }
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || "Failed to fetch rundown",
    });
  } finally {
    clearTimeout(timeoutId);
  }
});
