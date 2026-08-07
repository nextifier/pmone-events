/**
 * Per-page OG overrides from the PM One dashboard, the last remaining piece of
 * dashboard-managed config (everything else moved back into app.config.ts).
 *
 * Consumers read the resolved payload with `useNuxtData("og-pages")` at ACCESS
 * time rather than capturing this composable's `data` ref at setup: a captured
 * ref stayed on `default: null` inside component setups, which silently dropped
 * every dashboard OG image. `getCachedData` keeps the plugin's SSR fetch and any
 * later call collapsed into one request.
 */
export const useOgPages = () =>
  useFetch("/api/event/og-pages", {
    key: "og-pages",
    server: true,
    default: () => null,
    getCachedData: (key, nuxtApp) =>
      nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  });
