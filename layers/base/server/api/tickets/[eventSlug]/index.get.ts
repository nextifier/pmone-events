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
  const eventSlug = getRouterParam(event, "eventSlug");
  const locale = (getQuery(event).locale as string) || "en";

  // Forward the locale so PM One returns localized ticket copy and, in
  // `meta.terms`, the staff-managed purchase terms HTML for this locale.
  return await pmOnePublicFetch(
    `/events/${encodeURIComponent(eventSlug ?? "")}/tickets`,
    {
      query: { locale },
      errorShape: "statusMessage",
      errorPrefix: "Tickets fetch",
    },
  );
});
