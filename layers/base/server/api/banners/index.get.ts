/**
 * Public banners listing for the current event website.
 *
 * Adapter route: like the hotels adapter, each event site must only ever surface
 * the banners that belong to its own project. We force `project_slug` from the
 * app config so the `<BannerHero />` component can stay identical across repos
 * while still being correctly project-scoped here. Client query (e.g.
 * `placement=hero`) is passed through.
 */
export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const appConfig = useAppConfig();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const username =
        appConfig.app.dataSourceUsername || appConfig.app.projectUsername;

      const response = await $fetch(
        `${config.public.apiUrl}/api/public/banners`,
        {
          headers: {
            "X-API-Key": config.pmOneApiKey,
            Accept: "application/json",
          },
          // `project_slug` is appended last so it always wins over any client input.
          query: { ...getQuery(event), project_slug: username },
          signal: controller.signal,
        },
      );

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
        message: error.message || "Failed to fetch banners",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    name: "api-banners",
    maxAge: 60,
    swr: true,
    getKey: (event) => {
      const q = getQuery(event);
      return (
        Object.entries(q)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}=${v}`)
          .join("&") || "default"
      );
    },
  },
);
