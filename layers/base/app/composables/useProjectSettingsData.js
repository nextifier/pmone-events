/**
 * Shared raw fetch for the PM One project website-settings payload. A single
 * useFetch keyed per-locale so the server plugin (which awaits it before any
 * page setup runs), `useProjectSettings`, `useSiteConfig`, and `usePageMeta`
 * all read the same asyncData entry for a given locale - never duplicate
 * requests within one render.
 *
 * The server plugin guarantees the payload is resolved during SSR, which lets
 * `usePageMeta` decide synchronously between a real `og:image`/dashboard-copy
 * value from PM One and the generated Takumi card / baked content.js value.
 *
 * The `locale` query param (plan 012) only affects one sub-key of the
 * response - `site_config.copy` (dashboard SEO meta, translatable). Every
 * other sub-key (nav/analytics/appearance/identity/og_pages/home sections) is
 * locale-agnostic and returns identically regardless of the value sent here;
 * they simply ride along on the same already-awaited fetch, per the
 * zero-round-trip rule in docs/site-config-contract.md. Keying the fetch (and
 * the Nitro proxy's cache, see server/api/event/website-settings.get.ts) by
 * locale is required so `<title>`/description resolve correctly on the
 * server for the requested language - mirrors `useWebsitePage.ts`'s
 * per-locale key for the sibling `website-pages` endpoint.
 *
 * `watch: [locale]` is required, not just the per-locale `key`: this fetch is
 * first resolved once inside the `projectSettings` plugin at app boot, and a
 * client-side locale switch under `prefix_except_default` routing can reuse
 * the same page component instance (no remount, so composables do not
 * re-run) - without an explicit watch, `dashboardCopy` in `usePageMeta` would
 * keep serving the previous locale's value after such a switch. Mirrors
 * `useWebsitePage.ts`'s identical `watch: [locale]` for the same reason.
 */
export const useProjectSettingsData = () => {
  const { locale } = useI18n();

  return useFetch("/api/event/website-settings", {
    query: { locale },
    key: () => `project-settings-${locale.value}`,
    watch: [locale],
    server: true,
    default: () => null,
  });
};
