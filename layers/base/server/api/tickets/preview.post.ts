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
    // Query string, not body: PM One reads the bypass from the query only,
    // because this proxy forwards the browser's body verbatim.
    query: { ...adminPreviewFlag(event, "force_checkout_ticket"), ...previewTokenQuery(event) },
    errorShape: "statusMessage",
    errorPrefix: "Preview",
  });
});
