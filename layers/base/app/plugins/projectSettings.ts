/**
 * Resolve the PM One website-settings payload before any page setup runs on
 * the server. `usePageMeta` must branch synchronously between a project OG
 * image (from the API) and the generated Takumi card - registering both would
 * emit duplicate og:image tags. Cost is one lookup against the Nitro proxy's
 * 300s SWR cache; on API failure the payload stays null and every page falls
 * back to the Takumi card. The client reads the same key from the hydration
 * payload, so this never blocks in the browser.
 */
export default defineNuxtPlugin(async () => {
  if (import.meta.server) {
    await useProjectSettingsData();
  }
});
