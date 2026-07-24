/**
 * One-click dashboard sign-in for the ticket holder. Mints a short-lived,
 * single-use magic-link login (no email) and returns its verify URL.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `POST /api/public/attendees/{ulid}/dashboard-link`.
 */
export default defineEventHandler(async (event) => {
  const ulid = getRouterParam(event, "ulid");
  // Forward the body so the secret email login token reaches the backend.
  const body = await readBody(event).catch(() => ({}));

  return await pmOnePublicFetch(
    `/attendees/${encodeURIComponent(ulid ?? "")}/dashboard-link`,
    {
      method: "POST",
      body,
      errorShape: "statusMessage",
      errorPrefix: "Could not open the dashboard",
    },
  );
});
