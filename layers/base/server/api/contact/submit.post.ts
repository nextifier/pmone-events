export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const appConfig = useAppConfig();
  const body = await readBody(event);

  // Forward the real visitor IP + user-agent to PM One. This route runs at the
  // Cloudflare edge, so the actual client is in `cf-connecting-ip`; without
  // forwarding it, PM One only ever sees this worker's egress IP, which breaks
  // abuse forensics and per-IP throttling (every visitor would share one IP).
  const clientIp =
    getRequestHeader(event, "cf-connecting-ip") ||
    getRequestHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader(event, "x-real-ip") ||
    "";

  const userAgent = getRequestHeader(event, "user-agent") || "";

  // Cloudflare Turnstile: verify the human-challenge token at the edge before
  // proxying to PM One. Skipped entirely when no secret is configured, so the
  // form keeps working until the Turnstile keys are set in the environment.
  const turnstileSecret = config.turnstileSecret as string;
  if (turnstileSecret) {
    const token = body.cf_turnstile_response;

    if (!token) {
      throw createError({
        statusCode: 400,
        message: "Security verification required. Please try again.",
      });
    }

    const verify = await $fetch<{ success: boolean }>(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: {
          secret: turnstileSecret,
          response: token,
          ...(clientIp ? { remoteip: clientIp } : {}),
        },
        // The only non-PM-One egress in this layer, and it used to have no
        // ceiling at all — a slow Turnstile would hold the submit open.
        timeout: 5000,
      },
    );

    if (!verify?.success) {
      throw createError({
        statusCode: 403,
        message: "Security verification failed. Please try again.",
      });
    }
  }

  return await pmOneRequest("/api/contact-forms/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      ...(userAgent ? { "User-Agent": userAgent } : {}),
    },
    body: {
      // Resolved server-side, never taken from the request body — a submission
      // must land on THIS site's project. Note `projectUsername`, not the data
      // source: co-located sites (icf/cokelatexpo reading cbe's content) still
      // own their own contact inbox.
      project_username: appConfig.app.projectUsername,
      subject: body.subject,
      data: body.data,
      // Honeypot fields for bot detection
      website: body.website || "",
      _token_time: body._token_time || "",
    },
    errorPrefix: "Contact form submit",
  });
});
