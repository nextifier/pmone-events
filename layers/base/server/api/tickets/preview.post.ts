/**
 * Cart pricing preview for the ticket checkout.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `POST /api/public/tickets/preview`. Body: `{ event_id, items[] }`.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return await pmOnePublicFetch("/tickets/preview", {
    method: "POST",
    body,
    errorShape: "statusMessage",
    errorPrefix: "Preview",
  });
});
