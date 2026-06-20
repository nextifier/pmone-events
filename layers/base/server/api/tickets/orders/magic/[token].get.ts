/**
 * Order + all attendees via the emailed magic link (Manage Attendees without a
 * login).
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `GET /api/public/ticket-orders/magic/{token}`.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const token = getRouterParam(event, "token");

  const baseUrl = (config.public as any).apiUrl || "http://localhost:8000";
  const apiKey = (config as any).pmOneApiKey;

  try {
    return await $fetch(
      `${baseUrl}/api/public/ticket-orders/magic/${token}`,
      {
        headers: { "X-API-Key": apiKey },
      }
    );
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status ?? 500,
      statusMessage:
        err?.data?.message || err?.message || "This link is invalid or has expired",
      data: err?.data,
    });
  }
});
