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

  // 422 carries the validation payload (error_code/message); pmOneRequest
  // forwards `data` so the UI can show a precise reason.
  return await pmOnePublicFetch("/tickets/validate-access-code", {
    method: "POST",
    body,
    errorShape: "statusMessage",
    errorPrefix: "Validation",
  });
});
