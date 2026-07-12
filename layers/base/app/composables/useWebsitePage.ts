/**
 * Fetches the dashboard-managed override body for one of the six baked
 * legal/policy pages (`terms`, `privacy`, `event-policy`, `help-center`,
 * `ticket-terms-and-conditions`, `ticket-refund-and-return-policy`) - see
 * PM One plan 011.
 *
 * Unlike the tiny `site_config` block (delivered inside the awaited
 * website-settings payload per the site-config contract's zero-round-trip
 * rule), page bodies are potentially large and only the legal pages need
 * them, so plan 011 serves them from a dedicated cached endpoint. This is a
 * server-side (SSR) fetch so the legal body is crawlable and paints without
 * CLS, matching the perf/SEO guardrail.
 *
 * Fail-open (the legal-page invariant): `overrideBody` is `null` whenever the
 * project has no override for this key, the requested locale has no saved
 * translation, or the fetch fails (PM One outage). The page then renders its
 * baked `<p>` copy - a legal page must NEVER render empty.
 */
export function useWebsitePage(key: string) {
  const { locale } = useI18n();

  const { data } = useFetch<{
    data?: Record<string, { body: string | null }>;
  }>("/api/event/website-pages", {
    query: { locale },
    watch: [locale],
    // One fetch shared across the six legal pages for a given locale.
    key: () => `website-pages-${locale.value}`,
  });

  const overrideBody = computed<string | null>(
    () => data.value?.data?.[key]?.body ?? null,
  );

  return { overrideBody };
}
