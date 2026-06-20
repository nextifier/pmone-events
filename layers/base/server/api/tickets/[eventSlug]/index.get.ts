/**
 * Public ticket listing for an event website.
 *
 * Adapter route mirroring `server/api/hotels/index.get.ts`: the X-API-Key is
 * attached server-side so the key never reaches the browser. Proxies PM One's
 * `GET /api/public/events/{eventSlug}/tickets`, which the backend gates behind
 * the per-event tickets toggle (returns 404 TICKETS_DISABLED when off — the
 * `<TicketList>` component treats that as "fall back to the static tickets").
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const eventSlug = getRouterParam(event, "eventSlug");
  const locale = (getQuery(event).locale as string) || "en";

  const baseUrl = (config.public as any).apiUrl || "http://localhost:8000";
  const apiKey = (config as any).pmOneApiKey;

  try {
    // Forward the locale so PM One returns localized ticket copy and, in
    // `meta.terms`, the staff-managed purchase terms HTML for this locale.
    return await $fetch(
      `${baseUrl}/api/public/events/${eventSlug}/tickets`,
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
      statusMessage: err?.data?.message || err?.message || "Failed to fetch tickets",
      data: err?.data,
    });
  }
});
