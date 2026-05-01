export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const appConfig = useAppConfig();
  const slug = getRouterParam(event, "slug");
  const query = getQuery(event);
  const locale = (query.locale as string) || "en";

  if (!slug) {
    throw createError({ statusCode: 400, message: "Missing slug" });
  }

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
      throw createError({ statusCode: 404, message: "No active event" });
    }

    const guest = await $fetch(
      `${config.public.apiUrl}/api/public/projects/${username}/events/${eventSlug}/guests/${slug}`,
      {
        headers,
        query: { locale },
        signal: controller.signal,
      },
    );

    return guest;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw createError({
        statusCode: 504,
        message: "Request timeout - API server took too long to respond",
      });
    }
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || "Failed to fetch guest",
    });
  } finally {
    clearTimeout(timeoutId);
  }
});
