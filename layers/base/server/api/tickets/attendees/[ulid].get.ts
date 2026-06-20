/**
 * Single attendee e-ticket (shareable). The opaque ulid is the access key, so
 * the page can be shared without a login.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `GET /api/public/attendees/{ulid}`.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const ulid = getRouterParam(event, "ulid");

  const baseUrl = (config.public as any).apiUrl || "http://localhost:8000";
  const apiKey = (config as any).pmOneApiKey;

  try {
    return await $fetch(`${baseUrl}/api/public/attendees/${ulid}`, {
      headers: { "X-API-Key": apiKey },
    });
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status ?? 500,
      statusMessage: err?.data?.message || err?.message || "Ticket not found",
      data: err?.data,
    });
  }
});
