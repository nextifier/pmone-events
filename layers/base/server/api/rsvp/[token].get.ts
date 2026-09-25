/**
 * One RSVP invitation by its personal token: the guest, their answer so far,
 * the event, the ticket's day/session choices and the registration questions.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `GET /api/public/rsvp/{token}`. The visitor IP is forwarded so the backend
 * throttle sees one guest, not every site's worker at once.
 */
export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");
  const locale = (getQuery(event).locale as string) || "en";

  const clientIp =
    getRequestHeader(event, "cf-connecting-ip") ||
    getRequestHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader(event, "x-real-ip") ||
    "";

  return await pmOnePublicFetch(`/rsvp/${encodeURIComponent(token ?? "")}`, {
    query: { locale },
    headers: clientIp ? { "X-Forwarded-For": clientIp } : {},
    errorShape: "statusMessage",
    errorPrefix: "This invitation link is invalid",
  });
});
