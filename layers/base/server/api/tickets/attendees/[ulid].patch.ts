/**
 * Personalize an attendee (rename, optional email/phone).
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `PATCH /api/public/attendees/{ulid}`. Locked once checked in (the backend
 * returns 422).
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const ulid = getRouterParam(event, "ulid");
  const body = await readBody(event);

  const baseUrl = (config.public as any).apiUrl || "http://localhost:8000";
  const apiKey = (config as any).pmOneApiKey;

  try {
    return await $fetch(`${baseUrl}/api/public/attendees/${ulid}`, {
      method: "PATCH",
      headers: { "X-API-Key": apiKey },
      body,
    });
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status ?? 500,
      statusMessage:
        err?.data?.message || err?.message || "Could not update ticket",
      data: err?.data,
    });
  }
});
