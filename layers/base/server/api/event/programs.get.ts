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

    const baseOpts = { headers, signal: controller.signal };

    // Resolve event slug. Prefer the project's active event; fall back to the
    // most recent event by start_date so programs still render even when no
    // event is currently flagged is_active=true. Only when neither exists do we
    // return an empty payload so the component shows nothing instead of a
    // generic fetch-error UI.
    const active = await $fetch<{ data: { slug: string } }>(
      `${config.public.apiUrl}/api/public/projects/${username}/events/active`,
      baseOpts,
    ).catch(() => null);

    let eventSlug = active?.data?.slug;

    if (!eventSlug) {
      const latest = await $fetch<{ data: Array<{ slug: string }> }>(
        `${config.public.apiUrl}/api/public/projects/${username}/events`,
        { ...baseOpts, query: { per_page: 1, sort: "-start_date" } },
      ).catch(() => null);
      eventSlug = latest?.data?.[0]?.slug;
    }

    if (!eventSlug) {
      return { data: [] };
    }

    const programs = await $fetch(
      `${config.public.apiUrl}/api/public/projects/${username}/events/${eventSlug}/programs`,
      {
        ...baseOpts,
        query: { locale },
      },
    );

    return programs;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw createError({
        statusCode: 504,
        message: "Request timeout - API server took too long to respond",
      });
    }
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || "Failed to fetch programs",
    });
  } finally {
    clearTimeout(timeoutId);
  }
});
