/**
 * BreadcrumbList JSON-LD for two-level detail pages (`/section/[slug]`):
 * brand, guest, and news detail (Home -> Section -> Item).
 *
 * Wraps nuxt-seo-utils' auto-imported `useBreadcrumbItems()`, which already
 * resolves absolute, locale-correct URLs and injects the `BreadcrumbList`
 * node into the page's schema.org @graph via `useSchemaOrg` during SSR
 * (see nuxt-seo-utils/dist/runtime/app/composables/useBreadcrumbItems.js -
 * it runs on `import.meta.server`, so this stays SSR-rendered). The only
 * thing every detail page needs is swapping the auto-derived, slug-derived
 * title-case label ("Some Slug") for the item's real display name on the
 * final (current) segment - that's all this composable does, so all three
 * pages stay consistent.
 *
 * The override index is computed from the current path depth (locale prefix
 * stripped, mirroring app.vue's `stripLocaleFromPath`) rather than hardcoded
 * to `2`, so it stays correct in every locale, including non-default ones
 * where the URL gains a leading `/id`, `/zh`, etc. segment.
 *
 * Deliberately NOT applied to the by-edition archive route
 * (`/[edition]/brands/[slug]`, e.g. `/2024/brands/x`): that path has no page
 * at the intermediate `/2024` segment, so a generic depth-based breadcrumb
 * there would emit a BreadcrumbList item pointing at a URL with no matching
 * route - worse than no breadcrumb at all. Left as a follow-up requiring a
 * bespoke override, not a gap this composable should paper over.
 *
 * Requires `schemaOrg.enabled` (nuxt-schema-org) to be on for the app - true
 * for every app except `campx`, which was already opted out before this plan
 * (pre-existing, out of scope here).
 *
 * @param {import("vue").MaybeRefOrGetter<string>} currentLabel - the item's
 *   real name (e.g. brand.brand_name, guest.name, post.title).
 */
export function useDetailBreadcrumbs(currentLabel) {
  const route = useRoute();
  const { locales } = useI18n();

  const overrides = computed(() => {
    const label = toValue(currentLabel);
    if (!label) return [];

    const localeCodes = locales.value.map((l) => l.code);
    const segments = route.path.split("/").filter(Boolean);
    const depth = localeCodes.includes(segments[0])
      ? segments.length - 1
      : segments.length;

    return Array(depth).fill(undefined).concat([{ label }]);
  });

  return useBreadcrumbItems({ overrides });
}
