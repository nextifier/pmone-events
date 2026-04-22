export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  if (!body?.clickable_type || !body?.clickable_id) {
    throw createError({
      statusCode: 422,
      message: "clickable_type and clickable_id are required",
    });
  }

  const headers = getRequestHeaders(event);

  try {
    return await $fetch(`${config.public.apiUrl}/api/track/click`, {
      method: "POST",
      headers: {
        "X-API-Key": config.pmOneApiKey,
        "User-Agent": headers["user-agent"] || "",
        Referer: headers.referer || "",
        Accept: "application/json",
      },
      body: {
        clickable_type: body.clickable_type,
        clickable_id: body.clickable_id,
        link_label: body.link_label || null,
      },
    });
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.data?.message || error.message || "Failed to track click",
    });
  }
});
