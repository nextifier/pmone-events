/**
 * Click tracking (banner CTAs, brand outbound links, link-page items).
 *
 * The User-Agent and Referer are forwarded because PM One uses them to drop bot
 * traffic and to build the referer breakdown in the dashboard — without them
 * every click would look like it came from the Worker.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body?.clickable_type || !body?.clickable_id) {
    throw createError({
      statusCode: 422,
      message: "clickable_type and clickable_id are required",
    });
  }

  const headers = getRequestHeaders(event);

  return await pmOneRequest("/api/track/click", {
    method: "POST",
    headers: {
      "User-Agent": headers["user-agent"] || "",
      Referer: headers.referer || "",
    },
    body: {
      clickable_type: body.clickable_type,
      clickable_id: body.clickable_id,
      link_label: body.link_label || null,
    },
    // Beacon-style call the client never awaits; a hung upstream must not keep
    // the Worker alive (this route had no timeout at all).
    timeoutMs: 5000,
    errorPrefix: "Click tracking",
  });
});
