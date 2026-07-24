/**
 * Content-store keys each base page dereferences, keyed by the page's Nuxt
 * route name (the `@nuxtjs/i18n` module suffixes route names with
 * `___<locale>`, e.g. `book-space___en` - `checkContentContract` strips
 * that before matching, mirroring the pattern already used in
 * `Rundown.vue`/`MainPrograms.vue`).
 *
 * Each app OVERRIDES `app/composables/content.js` entirely (Nuxt layers
 * replace, not merge, the file) so a reduced-store app can omit keys a base
 * page still reads. The base section components already degrade gracefully
 * when a key is missing (render nothing / fall back - see
 * plans/015-content-contract-and-campx-500.md), so a missing key is never
 * fatal. This map turns that silent gap into a loud dev-time console
 * warning instead of a surprise an app owner discovers later.
 *
 * Keep this updated when a base page starts reading a new `pages.*` /
 * `components.*` key.
 */
export const REQUIRED_CONTENT_KEYS: Record<string, string[]> = {
  index: ["pages.home", "components.hero"],
  "book-space": ["pages.bookSpace", "components.bookSpace"],
  contact: ["pages.contact", "components.contact"],
  partners: ["pages.partners", "components.mediaCoverage", "components.credits"],
  brands: ["pages.brands", "components.brandList"],
  rundown: ["pages.rundown", "components.rundown"],
  programs: ["pages.programs", "components.mainPrograms"],
  gallery: ["pages.gallery"],
  winner: ["pages.winner"],
  faq: ["components.faq"],
  tickets: ["pages.ticket"],
};

function getByPath(source: Record<string, unknown>, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
      source,
    );
}

/**
 * Dev-only. Call with the active route's raw `route.name` (may carry the
 * i18n locale suffix); no-ops outside `import.meta.dev` and in production
 * builds this call is dead-code-eliminated entirely, so it never affects
 * production behavior.
 */
export function checkContentContract(routeName: unknown): void {
  if (!import.meta.dev) return;

  const baseName = (routeName?.toString() ?? "").split("___")[0];
  const requiredKeys = REQUIRED_CONTENT_KEYS[baseName];
  if (!requiredKeys) return;

  // Read through the store proxy, NOT `$state`. The base `content.js` is an
  // options store (so `pages`/`components` live on `$state`), but every app
  // override is a setup store returning `computed()`s - Pinia files those as
  // getters and they never appear on `$state`. Going through the proxy
  // resolves state, getters and actions alike, so both shapes work.
  const store = useContentStore() as unknown as Record<string, unknown> & {
    contentContractOmit?: string[];
  };

  // An app that renders a bespoke component (e.g. iicc ships its own Hero.vue
  // and index.vue instead of the base ones) legitimately does not read the base
  // key the base page would. It declares those keys in `contentContractOmit` so
  // this check doesn't flag an intentional, correct omission.
  const omit = store.contentContractOmit ?? [];
  const missing = requiredKeys.filter(
    (key) => !omit.includes(key) && getByPath(store, key) == null,
  );

  if (missing.length) {
    console.warn(
      `[content-contract] Route "${baseName}" is missing content-store key(s): ${missing.join(", ")}. ` +
        `The affected section(s) will render hidden or fall back to generic copy instead of throwing. ` +
        `Add the key(s) to this app's app/composables/content.js override if the section should show real copy.`,
    );
  }
}
