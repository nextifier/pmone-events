export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

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
