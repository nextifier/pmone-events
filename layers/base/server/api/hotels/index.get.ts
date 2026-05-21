/**
 * Public hotels listing for the current event website.
 *
 * Adapter route: unlike the pmone admin app (which proxies `/api/public/hotels`
 * unscoped and shows every hotel), each event site must only ever surface the
 * hotels that belong to its own project. We force `project_slug` from the
 * app config so the `<Hotels />` component can stay byte-identical across repos
 * while still being correctly project-scoped here.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const appConfig = useAppConfig();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const username =
      appConfig.app.dataSourceUsername || appConfig.app.projectUsername;

    const response = await $fetch(`${config.public.apiUrl}/api/public/hotels`, {
      headers: {
        "X-API-Key": config.pmOneApiKey,
        Accept: "application/json",
      },
      // `project_slug` is appended last so it always wins over any client input.
      query: { ...getQuery(event), project_slug: username },
      signal: controller.signal,
    });

    return response;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw createError({
        statusCode: 504,
        message: "Request timeout - API server took too long to respond",
      });
    }
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.message || "Failed to fetch hotels",
    });
  } finally {
    clearTimeout(timeoutId);
  }
});
