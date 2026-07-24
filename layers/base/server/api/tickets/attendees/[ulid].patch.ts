/**
 * Personalize an attendee (rename, optional email/phone).
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `PATCH /api/public/attendees/{ulid}`. Locked once checked in (the backend
 * returns 422).
 */
export default defineEventHandler(async (event) => {
  const ulid = getRouterParam(event, "ulid");
  const body = await readBody(event);

  return await pmOnePublicFetch(
    `/attendees/${encodeURIComponent(ulid ?? "")}`,
    {
      method: "PATCH",
      body,
      errorShape: "statusMessage",
      errorPrefix: "Could not update ticket",
    },
  );
});
