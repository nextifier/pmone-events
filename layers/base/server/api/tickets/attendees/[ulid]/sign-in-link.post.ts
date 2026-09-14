/**
 * Emails the ticket holder a fresh sign-in link once the one-tap link in their
 * ticket email has expired. The link goes to the holder's own address, never
 * to whoever is looking at the page.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `POST /api/public/attendees/{ulid}/sign-in-link`.
 */
export default defineEventHandler(async (event) => {
  const ulid = getRouterParam(event, "ulid");
  // Only the (expired) email login token: it is what proves the caller came
  // from the ticket email rather than from a forwarded page URL.
  const body = await readBody(event).catch(() => ({}));

  return await pmOnePublicFetch(
    `/attendees/${encodeURIComponent(ulid ?? "")}/sign-in-link`,
    {
      method: "POST",
      body: { token: body?.token },
      errorShape: "statusMessage",
      errorPrefix: "Could not send the sign-in link",
    },
  );
});
