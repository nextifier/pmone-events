/**
 * Shared raw fetch for the PM One project website-settings payload. A single
 * useFetch keyed "project-settings" so the server plugin (which awaits it
 * before any page setup runs), `useProjectSettings`, `useSiteConfig`, and
 * `usePageMeta` all read the same asyncData entry - never duplicate requests.
 *
 * The server plugin guarantees the payload is resolved during SSR, which lets
 * `usePageMeta` decide synchronously between a real `og:image`/dashboard-copy
 * value from PM One and the generated Takumi card / baked content.js value.
 *
 * Deliberately locale-agnostic - this must NOT call `useI18n()` or otherwise
 * depend on the current locale. This composable is invoked from the
 * `projectSettings` plugin's `setup()` (see app/plugins/projectSettings.ts),
 * which runs before any page/component `setup()`; calling `useI18n()` there
 * throws ("Must be called at the top of a setup function") because Nuxt/Vue's
 * injection context isn't a component setup context inside a plugin. Every
 * OTHER sub-key of this payload is already locale-agnostic (nav/analytics/
 * appearance/identity/og_pages/home sections). `site_config.copy` (plan 012,
 * dashboard-managed SEO meta) is the one locale-DEPENDENT sub-key - the
 * backend resolves that by returning every saved locale in one response (see
 * `PublicProjectController::websiteCopyPayload()`), so this fetch stays a
 * single locale-agnostic request and `usePageMeta` (which DOES run inside its
 * own component setup(), where `useI18n()` is valid) picks the current locale
 * itself out of that per-locale map.
 */
export const useProjectSettingsData = () =>
  useFetch("/api/event/website-settings", {
    key: "project-settings",
    server: true,
    default: () => null,
  });
