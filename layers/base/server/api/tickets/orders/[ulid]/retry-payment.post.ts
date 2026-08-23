/**
 * Re-open a gateway checkout for an order whose payment link never arrived,
 * because the upstream checkout job exhausted its retries. Mirrors
 * `hotels/reservation/[token]/retry-payment.post.ts`.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `POST /api/public/ticket-orders/{ulid}/retry-payment`.
 */
export default defineEventHandler(async (event) => {
  const ulid = getRouterParam(event, "ulid");

  // Forward the real visitor IP to PM One. This route runs at the Cloudflare
  // edge, so the actual client is in `cf-connecting-ip`; without forwarding it
  // PM One only ever sees this worker's egress IP, and every buyer across all
  // 11 event sites shares one throttle bucket. Same resolution order as the
  // contact/form proxies.
  const clientIp =
    getRequestHeader(event, "cf-connecting-ip") ||
    getRequestHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader(event, "x-real-ip") ||
    "";

  return await pmOnePublicFetch(
    `/ticket-orders/${encodeURIComponent(ulid ?? "")}/retry-payment`,
    {
      method: "POST",
      headers: clientIp ? { "X-Forwarded-For": clientIp } : undefined,
      errorShape: "statusMessage",
      errorPrefix: "Retry",
    },
  );
});
