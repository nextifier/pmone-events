/**
 * Shared raw fetch for the PM One project website-settings payload. A single
 * useFetch keyed "project-settings" so the server plugin (which awaits it
 * before any page setup runs), `useProjectSettings`, and `usePageMeta` all
 * read the same asyncData entry - never duplicate requests.
 *
 * The server plugin guarantees the payload is resolved during SSR, which lets
 * `usePageMeta` decide synchronously between a real `og:image` URL from PM One
 * and the generated Takumi card.
 */
export const useProjectSettingsData = () =>
  useFetch("/api/event/website-settings", {
    key: "project-settings",
    server: true,
    default: () => null,
  });
