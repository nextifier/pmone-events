/**
 * Email-first account lookup for the ticket checkout.
 *
 * Adapter route (X-API-Key server-side) proxying PM One's
 * `POST /api/public/tickets/email-lookup`. The backend returns ONLY
 * `{ exists: bool }` and never any PII, so the form can offer login without
 * leaking another person's data.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  const baseUrl = (config.public as any).apiUrl || "http://localhost:8000";
  const apiKey = (config as any).pmOneApiKey;

  try {
    return await $fetch(`${baseUrl}/api/public/tickets/email-lookup`, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
      },
      body,
    });
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status ?? 500,
      statusMessage: err?.data?.message || err?.message || "Lookup failed",
      data: err?.data,
    });
  }
});
