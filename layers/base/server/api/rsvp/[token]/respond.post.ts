/**
 * Record the guest's answer (attending / declined / maybe) with party size,
 * guest names, day or session and registration answers.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `POST /api/public/rsvp/{token}/respond`. The visitor IP is forwarded so the
 * backend throttle sees one guest, not every site's worker at once.
 */
export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token");
  const body = await readBody(event).catch(() => ({}));
  const locale = (getQuery(event).locale as string) || "en";

  const clientIp =
    getRequestHeader(event, "cf-connecting-ip") ||
    getRequestHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader(event, "x-real-ip") ||
    "";

  return await pmOnePublicFetch(
    `/rsvp/${encodeURIComponent(token ?? "")}/respond`,
    {
      method: "POST",
      body,
      query: { locale },
      headers: clientIp ? { "X-Forwarded-For": clientIp } : {},
      errorShape: "statusMessage",
      errorPrefix: "Could not save your answer",
    },
  );
});
