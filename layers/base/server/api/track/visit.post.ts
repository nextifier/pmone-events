/**
 * Visit tracking (banner impressions, brand profile visits, link-page visits).
 *
 * The User-Agent and Referer are forwarded because PM One uses them to drop bot
 * traffic and to build the referer breakdown in the dashboard — without them
 * every visit would look like it came from the Worker.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body?.visitable_type || !body?.visitable_id) {
    throw createError({
      statusCode: 422,
      message: "visitable_type and visitable_id are required",
    });
  }

  const headers = getRequestHeaders(event);

  return await pmOneRequest("/api/track/visit", {
    method: "POST",
    headers: {
      "User-Agent": headers["user-agent"] || "",
      Referer: headers.referer || "",
    },
    body: {
      visitable_type: body.visitable_type,
      visitable_id: body.visitable_id,
    },
    // Beacon-style call the client never awaits; a hung upstream must not keep
    // the Worker alive (this route had no timeout at all).
    timeoutMs: 5000,
    errorPrefix: "Visit tracking",
  });
});
