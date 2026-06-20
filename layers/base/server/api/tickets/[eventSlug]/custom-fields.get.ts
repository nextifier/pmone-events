/**
 * Business-matching custom fields for an event website's ticket checkout.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `GET /api/public/events/{eventSlug}/custom-fields`. Only fetched when the
 * buyer opts in to business matching, so the questions stay out of the way.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const eventSlug = getRouterParam(event, "eventSlug");
  const locale = (getQuery(event).locale as string) || "en";

  const baseUrl = (config.public as any).apiUrl || "http://localhost:8000";
  const apiKey = (config as any).pmOneApiKey;

  try {
    // Forward the locale so PM One returns each custom field's localized label.
    return await $fetch(
      `${baseUrl}/api/public/events/${eventSlug}/custom-fields`,
      {
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
        },
        query: { locale },
      }
    );
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status ?? 500,
      statusMessage:
        err?.data?.message || err?.message || "Failed to fetch custom fields",
      data: err?.data,
    });
  }
});
