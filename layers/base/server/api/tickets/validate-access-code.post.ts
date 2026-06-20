/**
 * Validate a ticket access code (unlock gated tickets + price-effect preview).
 *
 * Adapter route (X-API-Key server-side) proxying PM One's uncached, throttled
 * `POST /api/public/tickets/validate-access-code`. Body: `{ event_id, code,
 * email?, phone?, items? }`. On success the response carries the full unlocked
 * tickets so the listing can reveal hidden ones.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  const baseUrl = (config.public as any).apiUrl || "http://localhost:8000";
  const apiKey = (config as any).pmOneApiKey;

  try {
    return await $fetch(`${baseUrl}/api/public/tickets/validate-access-code`, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
      },
      body,
    });
  } catch (err: any) {
    // 422 carries the validation payload (error_code/message) — forward it so the
    // UI can show a precise reason instead of a generic failure.
    throw createError({
      statusCode: err?.response?.status ?? 500,
      statusMessage: err?.data?.message || err?.message || "Validation failed",
      data: err?.data,
    });
  }
});
