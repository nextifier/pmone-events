/**
 * Validate a ticket access code (unlock gated tickets + price-effect preview).
 *
 * Adapter route (X-API-Key server-side) proxying PM One's uncached, throttled
 * `POST /api/public/tickets/validate-access-code`. Body: `{ event_id, code,
 * email?, phone?, items? }`. On success the response carries the full unlocked
 * tickets so the listing can reveal hidden ones.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Forward the real visitor IP to PM One. This route runs at the Cloudflare
  // edge, so the actual client is in `cf-connecting-ip`; without forwarding it
  // PM One only ever sees this worker's egress IP, and every guest across all
  // 11 event sites shares one throttle bucket. That matters more here than
  // anywhere else: a shared invite code blasted over WhatsApp is opened by
  // hundreds of people at once, and one bucket would 429 most of them. Same
  // resolution order as the order/contact proxies.
  const clientIp =
    getRequestHeader(event, "cf-connecting-ip") ||
    getRequestHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader(event, "x-real-ip") ||
    "";

  // 422 carries the validation payload (error_code/message); pmOneRequest
  // forwards `data` so the UI can show a precise reason.
  return await pmOnePublicFetch("/tickets/validate-access-code", {
    method: "POST",
    body,
    headers: clientIp ? { "X-Forwarded-For": clientIp } : undefined,
    errorShape: "statusMessage",
    errorPrefix: "Validation",
  });
});
