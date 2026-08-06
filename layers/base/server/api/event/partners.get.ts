export default defineCachedEventHandler(
  async () => {
    // Shared, cached resolve — see server/utils/resolveEventSlug.ts.
    const eventSlug = await resolveEventSlug(contentUsername());

    if (!eventSlug) {
      return { data: [] };
    }

    const res = await pmOneFetch<{
      data: Array<{
        category: string;
        no_container: boolean;
        partners: Array<{
          name: string;
          logo: { sm?: string; url?: string } | null;
          link: string | null;
        }>;
      }>;
      meta?: unknown;
    }>(`/events/${eventSlug}/partners`, { errorPrefix: "Partners fetch" });

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
      meta: res?.meta ?? null,
    };
  },
  {
    name: "api-partners",
    maxAge: 15,
    // NOT swr. With SWR the expired entry is served while it revalidates, so
    // the request that triggers the refresh still renders stale data — and a
    // purge that lands in that window is undone. Kept false even though HTML is
    // no longer edge-cached (7 Aug 2026): 15 s of staleness is the budget.
    swr: false,
    getKey: () => "default",
  },
);
