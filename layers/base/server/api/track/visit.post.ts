export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  if (!body?.visitable_type || !body?.visitable_id) {
    throw createError({
      statusCode: 422,
      message: "visitable_type and visitable_id are required",
    });
  }

  const headers = getRequestHeaders(event);

  try {
    return await $fetch(`${config.public.apiUrl}/api/track/visit`, {
      method: "POST",
      headers: {
        "X-API-Key": config.pmOneApiKey,
        "User-Agent": headers["user-agent"] || "",
        Referer: headers.referer || "",
        Accept: "application/json",
      },
      body: {
        visitable_type: body.visitable_type,
        visitable_id: body.visitable_id,
      },
    });
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.data?.message || error.message || "Failed to track visit",
    });
  }
});
