/**
 * One-click dashboard sign-in for the ticket holder. Mints a short-lived,
 * single-use magic-link login (no email) and returns its verify URL.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `POST /api/public/attendees/{ulid}/dashboard-link`.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const ulid = getRouterParam(event, "ulid");
  // Forward the body so the secret email login token reaches the backend.
  const body = await readBody(event).catch(() => ({}));

  const baseUrl = (config.public as any).apiUrl || "http://localhost:8000";
  const apiKey = (config as any).pmOneApiKey;

  try {
    return await $fetch(`${baseUrl}/api/public/attendees/${ulid}/dashboard-link`, {
      method: "POST",
      headers: { "X-API-Key": apiKey },
      body,
    });
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status ?? 500,
      statusMessage:
        err?.data?.message || err?.message || "Could not open the dashboard",
      data: err?.data,
    });
  }
});
