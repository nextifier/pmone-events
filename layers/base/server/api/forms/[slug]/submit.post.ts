/**
 * Public form submission proxy (/forms/{slug}/submit).
 *
 * POST, never cached. The project username is resolved server-side (so the
 * browser can't target another project) and the real visitor IP + user-agent
 * are forwarded so PM One's per-IP throttling and abuse forensics see the actual
 * client instead of this worker's egress IP. The honeypot fields (website,
 * _token_time) pass through untouched for server-side bot detection.
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") ?? "";
  const body = await readBody(event);

  const clientIp =
    getRequestHeader(event, "cf-connecting-ip") ||
    getRequestHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader(event, "x-real-ip") ||
    "";
  const userAgent = getRequestHeader(event, "user-agent") || "";

  // pmOneFetch re-throws the upstream body, so the page can still map 422
  // responses.{ulid} errors, the 409 already-submitted card, or a 403 closed
  // message.
  return await pmOneFetch(
    `/forms/${encodeURIComponent(slug)}/submit`,
    {
      method: "POST",
      headers: {
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
      errorPrefix: "Form submit",
    },
  );
});
