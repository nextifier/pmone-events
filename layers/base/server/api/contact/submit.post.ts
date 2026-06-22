export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const data = await $fetch(
      `${config.public.apiUrl}/api/contact-forms/submit`,
      {
        method: "POST",
        headers: {
          "X-API-Key": config.pmOneApiKey, // Private - not exposed to browser
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
          ...(userAgent ? { "User-Agent": userAgent } : {}),
        },
        body: {
          project_username: body.project_username,
          subject: body.subject,
          data: body.data,
          // Honeypot fields for bot detection
          website: body.website || "",
          _token_time: body._token_time || "",
        },
        signal: controller.signal,
      },
    );

    return data;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw createError({
        statusCode: 504,
        message: "Request timeout - API server took too long to respond",
      });
    }

    // Return the error response from PM One API if available
    if (error.data) {
      throw createError({
        statusCode: error.response?.status || 500,
        message: error.data.message || "Failed to submit contact form",
        data: error.data,
      });
    }

    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || "Failed to submit contact form",
    });
  } finally {
    clearTimeout(timeoutId);
  }
});
