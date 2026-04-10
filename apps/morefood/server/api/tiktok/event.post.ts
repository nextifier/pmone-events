export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  // Parse pixel_code -> access_token mapping
  // Nuxt may auto-parse the JSON string from .env, or it may remain a string
  let tokenMap: Record<string, string> = {};
  const raw = config.tiktokAccessTokens;
  if (typeof raw === "object" && raw !== null) {
    tokenMap = raw as Record<string, string>;
  } else if (typeof raw === "string" && raw) {
    try {
      tokenMap = JSON.parse(raw);
    } catch {
      throw createError({
        statusCode: 500,
        message: "Invalid NUXT_TIKTOK_ACCESS_TOKENS format (expected JSON object)",
      });
    }
  }

  const accessToken = tokenMap[body.pixel_code];
  if (!accessToken) {
    throw createError({
      statusCode: 400,
      message: `No access token configured for pixel ${body.pixel_code}`,
    });
  }

  const clientIp =
    getRequestHeader(event, "cf-connecting-ip") ||
    getRequestHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getRequestHeader(event, "x-real-ip") ||
    "";

  const userAgent = getRequestHeader(event, "user-agent") || "";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const data = await $fetch(
      "https://business-api.tiktok.com/open_api/v1.3/event/track/",
      {
        method: "POST",
        headers: {
          "Access-Token": accessToken,
          "Content-Type": "application/json",
        },
        body: {
          event_source: "web",
          event_source_id: body.pixel_code,
          data: [
            {
              event: body.event,
              event_id: body.event_id,
              event_time: body.event_time || Math.floor(Date.now() / 1000),
              user: {
                ttclid: body.user?.ttclid || undefined,
                ttp: body.user?.ttp || undefined,
                external_id: body.user?.external_id || undefined,
                email: body.user?.email || undefined,
                phone: body.user?.phone || undefined,
                ip: clientIp || undefined,
                user_agent: userAgent || undefined,
              },
              page: {
                url: body.url || "",
                referrer: body.referrer || "",
              },
              properties: body.properties || {},
            },
          ],
        },
        signal: controller.signal,
      },
    );

    return data;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw createError({
        statusCode: 504,
        message: "TikTok API request timeout",
      });
    }

    console.error("[TikTok Events API]", error.data || error.message);

    throw createError({
      statusCode: error.response?.status || 500,
      message: error.data?.message || "Failed to send TikTok event",
    });
  } finally {
    clearTimeout(timeoutId);
  }
});
