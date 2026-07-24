/**
 * Order + all attendees via the emailed magic link (Manage Attendees without a
 * login).
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `GET /api/public/ticket-orders/magic/{token}`.
 */
export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");
  const locale = (getQuery(event).locale as string) || "en";

  return await pmOnePublicFetch(
    `/ticket-orders/magic/${encodeURIComponent(token ?? "")}`,
    {
      // Forward the locale so registration field labels come back localized.
      query: { locale },
      errorShape: "statusMessage",
      errorPrefix: "This link is invalid or has expired",
    },
  );
});
