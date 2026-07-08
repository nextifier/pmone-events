/**
 * Temp file upload for a public form file field (/forms/{slug}/upload).
 *
 * Byte-faithful multipart relay: reads the raw request body and forwards it
 * verbatim (with the original Content-Type incl. multipart boundary) to PM
 * One's project-scoped upload endpoint. Injects the X-API-Key + real visitor IP
 * / user-agent. Never cached. Longer timeout (60s) for larger uploads.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const appConfig = useAppConfig();
  const slug = getRouterParam(event, "slug");

  const username =
    appConfig.app.dataSourceUsername || appConfig.app.projectUsername;
  const baseUrl = (config.public as any).apiUrl || "http://localhost:8000";
  const apiKey = (config as any).pmOneApiKey;

  const clientIp =
    getRequestHeader(event, "cf-connecting-ip") ||
    getRequestHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader(event, "x-real-ip") ||
    "";
  const userAgent = getRequestHeader(event, "user-agent") || "";

  const raw = await readRawBody(event, false);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    return await $fetch(
      `${baseUrl}/api/public/projects/${username}/forms/${slug}/upload`,
      {
        method: "POST",
        body: raw,
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
          "Content-Type": getRequestHeader(event, "content-type") ?? "",
          ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
          ...(userAgent ? { "User-Agent": userAgent } : {}),
        },
        signal: controller.signal,
      },
    );
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw createError({
        statusCode: 504,
        message: "Request timeout - upload took too long",
      });
    }
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.data?.message || error.message || "Upload failed",
      data: error.data,
    });
  } finally {
    clearTimeout(timeoutId);
  }
});
