/**
 * Single attendee e-ticket (shareable). The opaque ulid is the access key, so
 * the page can be shared without a login.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `GET /api/public/attendees/{ulid}`.
 */
export default defineEventHandler(async (event) => {
  const ulid = getRouterParam(event, "ulid");
  const locale = (getQuery(event).locale as string) || "en";

  return await pmOnePublicFetch(
    `/attendees/${encodeURIComponent(ulid ?? "")}`,
    {
      // Forward the locale so registration field labels come back localized.
      query: { locale },
      errorShape: "statusMessage",
      errorPrefix: "Ticket not found",
    },
  );
});
