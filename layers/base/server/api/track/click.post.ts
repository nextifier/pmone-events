/**
 * Click tracking (banner CTAs, brand outbound links, link-page items).
 *
 * The client IP, User-Agent and Referer are forwarded because PM One uses them
 * to drop bot traffic, to build the referer breakdown, and to count unique
 * visitors — without them every click would look like it came from the Worker,
 * and every visitor would share a single per-IP throttle bucket.
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

  // This route runs at the Cloudflare edge, so the actual client sits in
  // `cf-connecting-ip`. Same resolution order as the contact/form proxies.
  const clientIp =
    headers["cf-connecting-ip"] ||
    headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    headers["x-real-ip"] ||
    "";

  return await pmOneRequest("/api/track/click", {
    method: "POST",
    headers: {
      ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
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
