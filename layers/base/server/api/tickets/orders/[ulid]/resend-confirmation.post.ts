/**
 * Re-send the buyer's own confirmation / e-ticket email. Offered on the result
 * page when the price phase delivers the e-ticket by email only, so the QR is
 * never on screen and a lost email would otherwise leave the buyer stuck.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `POST /api/public/ticket-orders/{ulid}/resend-confirmation`.
 */
export default defineEventHandler(async (event) => {
  const ulid = getRouterParam(event, "ulid");

  // Forward the real visitor IP: this route runs at the Cloudflare edge, so
  // without it PM One only ever sees the worker's egress IP and every buyer
  // across all the event sites shares one throttle bucket. Same resolution
  // order as the retry-payment proxy next door.
  const clientIp =
    getRequestHeader(event, "cf-connecting-ip") ||
    getRequestHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader(event, "x-real-ip") ||
    "";

  return await pmOnePublicFetch(
    `/ticket-orders/${encodeURIComponent(ulid ?? "")}/resend-confirmation`,
    {
      method: "POST",
      headers: clientIp ? { "X-Forwarded-For": clientIp } : undefined,
      errorShape: "statusMessage",
      errorPrefix: "Resend",
    },
  );
});
