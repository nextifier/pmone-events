/**
 * Order status + attendees by opaque ulid (post-checkout result page).
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `GET /api/public/ticket-orders/{ulid}`.
 */
export default defineEventHandler(async (event) => {
  const ulid = getRouterParam(event, "ulid");

  return await pmOnePublicFetch(
    `/ticket-orders/${encodeURIComponent(ulid ?? "")}`,
    { errorShape: "statusMessage", errorPrefix: "Order not found" },
  );
});
