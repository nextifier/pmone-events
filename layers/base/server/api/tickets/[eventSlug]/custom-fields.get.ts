/**
 * Business-matching custom fields for an event website's ticket checkout.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `GET /api/public/events/{eventSlug}/custom-fields`. Only fetched when the
 * buyer opts in to business matching, so the questions stay out of the way.
 */
export default defineEventHandler(async (event) => {
  const eventSlug = getRouterParam(event, "eventSlug");
  const locale = (getQuery(event).locale as string) || "en";

  // Forward the locale so PM One returns each custom field's localized label.
  return await pmOnePublicFetch(
    `/events/${encodeURIComponent(eventSlug ?? "")}/custom-fields`,
    {
      query: { locale },
      errorShape: "statusMessage",
      errorPrefix: "Custom fields fetch",
    },
  );
});
