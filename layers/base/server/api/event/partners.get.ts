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

      // Resolve event slug. Prefer the project's active event; fall back to the most
      // recent event by start_date so Credits still renders when no event is flagged
      // is_active=true.
      const active = await $fetch<{ data: { slug: string } }>(
        `${config.public.apiUrl}/api/public/projects/${username}/events/active`,
        baseOpts,
      ).catch(() => null);

      let eventSlug = active?.data?.slug;

      if (!eventSlug) {
        const latest = await $fetch<{ data: Array<{ slug: string }> }>(
          `${config.public.apiUrl}/api/public/projects/${username}/events`,
          { ...baseOpts, query: { per_page: 1, sort: "-start_date" } },
        ).catch(() => null);
        eventSlug = latest?.data?.[0]?.slug;
      }

      if (!eventSlug) {
        return { data: [] };
      }

      const res = await $fetch<{
        data: Array<{
          category: string;
          no_container: boolean;
          partners: Array<{
            name: string;
            logo: { sm?: string; url?: string } | null;
            link: string | null;
          }>;
        }>;
      }>(
        `${config.public.apiUrl}/api/public/projects/${username}/events/${eventSlug}/partners`,
        baseOpts,
      );

      // Map PM One's shape to the shape the Credits component expects (mirrors the old
      // local partners.js store): { category, noContainer, list: [{ img, link, name }] }.
      // Forward `meta` so the "previous edition" fallback notice keeps its source.
      return {
        data: (res?.data ?? []).map((c) => ({
          category: c.category,
          noContainer: c.no_container,
          list: (c.partners ?? []).map((p) => ({
            img: p.logo?.sm || p.logo?.url || "",
            link: p.link || "",
            name: p.name || "",
          })),
        })),
        meta: (res as { meta?: unknown })?.meta ?? null,
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw createError({
          statusCode: 504,
          message: "Request timeout - API server took too long to respond",
        });
      }
      throw createError({
        statusCode: error.response?.status || 500,
        message: error.message || "Failed to fetch partners",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    name: "api-partners",
    maxAge: 60,
    swr: true,
    getKey: () => "default",
  },
);
