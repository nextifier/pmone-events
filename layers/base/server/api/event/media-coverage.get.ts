export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const appConfig = useAppConfig();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const username =
        appConfig.app.dataSourceUsername || appConfig.app.projectUsername;

      const headers = {
        "X-API-Key": config.pmOneApiKey,
        Accept: "application/json",
      };

      const baseOpts = { headers, signal: controller.signal };

      // Resolve to null ONLY when the upstream says "no such resource" (404).
      // Any other failure (network, 5xx, timeout/abort) must propagate so
      // Nitro does not cache an empty 200 and the edge does not pin a blank
      // page for this handler's swr window.
      const orNullIf404 = (err: any) => {
        if (err?.response?.status === 404 || err?.statusCode === 404) {
          return null;
        }
        throw err;
      };

      // Resolve event slug. Prefer the project's active event; fall back to the
      // most recent event by start_date so coverage still renders even when no
      // event is currently flagged is_active=true.
      const active = await $fetch<{ data: { slug: string } }>(
        `${config.public.apiUrl}/api/public/projects/${username}/events/active`,
        baseOpts,
      ).catch(orNullIf404);

      let eventSlug = active?.data?.slug;

      if (!eventSlug) {
        const latest = await $fetch<{ data: Array<{ slug: string }> }>(
          `${config.public.apiUrl}/api/public/projects/${username}/events`,
          { ...baseOpts, query: { per_page: 1, sort: "-start_date" } },
        ).catch(orNullIf404);
        eventSlug = latest?.data?.[0]?.slug;
      }

      if (!eventSlug) {
        return { data: [] };
      }

      const mediaCoverages = await $fetch(
        `${config.public.apiUrl}/api/public/projects/${username}/events/${eventSlug}/media-coverages`,
        baseOpts,
      );

      return mediaCoverages;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw createError({
          statusCode: 504,
          message: "Request timeout - API server took too long to respond",
        });
      }
      throw createError({
        statusCode: error.response?.status || 500,
        message: error.message || "Failed to fetch media coverage",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    name: "api-media-coverage",
    maxAge: 15,
    swr: true,
    getKey: () => "default",
  },
);
