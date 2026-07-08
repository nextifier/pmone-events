/**
 * Public form submission proxy (/forms/{slug}/submit).
 *
 * Hand-rolled POST (never cached) mirroring contact/submit.post.ts: resolves the
 * project username server-side (so the browser can't target another project),
 * injects the X-API-Key, and forwards the real visitor IP + user-agent so PM
 * One's per-IP throttling and abuse forensics see the actual client instead of
 * this worker's egress IP. The honeypot fields (website, _token_time) pass
 * through untouched for server-side bot detection.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const appConfig = useAppConfig();
  const slug = getRouterParam(event, "slug");
  const body = await readBody(event);

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    return await $fetch(
      `${baseUrl}/api/public/projects/${username}/forms/${slug}/submit`,
      {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
          ...(userAgent ? { "User-Agent": userAgent } : {}),
        },
        body: {
          responses: body.responses ?? {},
          respondent_email: body.respondent_email ?? null,
          browser_fingerprint: body.browser_fingerprint ?? null,
          website: body.website ?? "",
          _token_time: body._token_time ?? "",
        },
        signal: controller.signal,
      },
    );
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw createError({
        statusCode: 504,
        message: "Request timeout - API server took too long to respond",
      });
    }
    // Re-throw the upstream body so the page can map 422 responses.{ulid}
    // errors, show the 409 already-submitted card, or a 403 closed message.
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.data?.message || error.message || "Failed to submit form",
      data: error.data,
    });
  } finally {
    clearTimeout(timeoutId);
  }
});
