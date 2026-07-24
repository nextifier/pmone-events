/**
 * Temp file upload for a public form file field (/forms/{slug}/upload).
 *
 * Byte-faithful multipart relay: reads the raw request body and forwards it
 * verbatim (with the original Content-Type incl. multipart boundary) to PM
 * One's project-scoped upload endpoint. Injects the X-API-Key + real visitor IP
 * / user-agent. Never cached. Longer timeout (60s) for larger uploads.
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") ?? "";

  const clientIp =
    getRequestHeader(event, "cf-connecting-ip") ||
    getRequestHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader(event, "x-real-ip") ||
    "";
  const userAgent = getRequestHeader(event, "user-agent") || "";

  const raw = await readRawBody(event, false);

  return await pmOneFetch(`/forms/${encodeURIComponent(slug)}/upload`, {
    method: "POST",
    body: raw,
    headers: {
      // Keep the original boundary — rewriting it breaks the multipart parse.
      "Content-Type": getRequestHeader(event, "content-type") ?? "",
      ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      ...(userAgent ? { "User-Agent": userAgent } : {}),
    },
    timeoutMs: 60000,
    errorPrefix: "Upload",
  });
});
