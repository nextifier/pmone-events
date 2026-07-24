/**
 * Ticket-registration custom fields for an event website's checkout.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `GET /api/public/events/{eventSlug}/registration-fields`. Returns the active
 * `ticket_registration` fields ([] when none). Deliberately NOT edge-cached
 * (consistent with the sibling business-matching custom-fields adapter).
 */
export default defineEventHandler(async (event) => {
  const eventSlug = getRouterParam(event, "eventSlug");
  const locale = (getQuery(event).locale as string) || "en";

  // Forward the locale so PM One returns each field's localized label.
  return await pmOnePublicFetch(
    `/events/${encodeURIComponent(eventSlug ?? "")}/registration-fields`,
    {
      query: { locale },
      errorShape: "statusMessage",
      errorPrefix: "Registration fields fetch",
    },
  );
});
