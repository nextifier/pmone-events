/**
 * Ticket-registration custom fields for an event website's checkout.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `GET /api/public/events/{eventSlug}/registration-fields`. Returns the active
 * `ticket_registration` fields ([] when none). Deliberately NOT edge-cached
 * (consistent with the sibling business-matching custom-fields adapter).
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const eventSlug = getRouterParam(event, "eventSlug");
  const locale = (getQuery(event).locale as string) || "en";

  const baseUrl = (config.public as any).apiUrl || "http://localhost:8000";
  const apiKey = (config as any).pmOneApiKey;

  try {
    // Forward the locale so PM One returns each field's localized label.
    return await $fetch(
      `${baseUrl}/api/public/events/${eventSlug}/registration-fields`,
      {
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
        },
        query: { locale },
      },
    );
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status ?? 500,
      statusMessage:
        err?.data?.message || err?.message || "Failed to fetch registration fields",
      data: err?.data,
    });
  }
});
