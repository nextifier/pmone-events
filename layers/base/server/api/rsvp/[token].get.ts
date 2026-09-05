/**
 * One RSVP invitation by its personal token: the guest, their answer so far,
 * the event, the ticket's day/session choices and the registration questions.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `GET /api/public/rsvp/{token}`.
 */
export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");
  const locale = (getQuery(event).locale as string) || "en";

  return await pmOnePublicFetch(`/rsvp/${encodeURIComponent(token ?? "")}`, {
    query: { locale },
    errorShape: "statusMessage",
    errorPrefix: "This invitation link is invalid",
  });
});
