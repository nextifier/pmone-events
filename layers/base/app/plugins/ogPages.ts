/**
 * Resolve the per-page OG overrides before any page setup runs on the server.
 *
 * `usePageMeta` has to branch SYNCHRONOUSLY between a dashboard og:image and a
 * generated Takumi card — registering both emits duplicate `og:image` tags — so
 * the payload must already be settled when a page's setup() runs. That is what
 * this awaited server plugin guarantees.
 *
 * It is the slimmed remainder of the old `projectSettings` plugin: same shape,
 * but the payload shrank from the whole website-settings blob to `og_pages`.
 * On prerendered pages this costs one build-time request, not a runtime one.
 */
export default defineNuxtPlugin({
  name: "ogPages",
  async setup() {
    if (import.meta.server) {
      await useOgPages();
    }
  },
});
