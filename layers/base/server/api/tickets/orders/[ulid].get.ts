/**
 * Order status + attendees by opaque ulid (post-checkout result page).
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `GET /api/public/ticket-orders/{ulid}`.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const ulid = getRouterParam(event, "ulid");

  const baseUrl = (config.public as any).apiUrl || "http://localhost:8000";
  const apiKey = (config as any).pmOneApiKey;

  try {
    return await $fetch(`${baseUrl}/api/public/ticket-orders/${ulid}`, {
      headers: { "X-API-Key": apiKey },
    });
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status ?? 500,
      statusMessage: err?.data?.message || err?.message || "Order not found",
      data: err?.data,
    });
  }
});
