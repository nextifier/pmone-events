export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const appConfig = useAppConfig();
  const query = getQuery(event);
  const locale = (query.locale as string) || "en";
  const featuredOnly = query.featured_only === "true" || query.featured_only === "1";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const username = appConfig.app.dataSourceUsername || appConfig.app.projectUsername;

    const headers = {
      "X-API-Key": config.pmOneApiKey,
      Accept: "application/json",
    };

    const activeEvent = await $fetch<{ data: { slug: string } }>(
      `${config.public.apiUrl}/api/public/projects/${username}/events/active`,
      { headers, signal: controller.signal },
    );

    const eventSlug = activeEvent?.data?.slug;
    if (!eventSlug) {
      return { data: [], meta: { count: 0, featured_count: 0 } };
    }

    const guests = await $fetch(
      `${config.public.apiUrl}/api/public/projects/${username}/events/${eventSlug}/guests`,
      {
        headers,
        query: { locale, ...(featuredOnly ? { featured_only: 1 } : {}) },
        signal: controller.signal,
      },
    );

    return guests;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw createError({
        statusCode: 504,
        message: "Request timeout - API server took too long to respond",
      });
    }
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || "Failed to fetch guests",
    });
  } finally {
    clearTimeout(timeoutId);
  }
});
