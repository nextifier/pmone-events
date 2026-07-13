// Content-store page keys -> canonical PM One OG page keys (kebab-case).
const OG_KEY_MAP = { bookSpace: "book-space", ticket: "tickets" };

export const usePageMeta = (pageKey, overrides = {}) => {
  const pageStore = useContentStore();
  const route = useRoute();
  const { locale } = useI18n();

  const meta = computed(() => pageKey ? pageStore.getMetaByKey(pageKey) : null);

  // Dashboard-managed SEO meta and per-page OG overrides (PM One project
  // settings -> SEO Meta / OG Images) share the one already-awaited
  // `website-settings` fetch - one shared asyncData entry per
  // docs/site-config-contract.md rule 1 (zero-round-trip).
  // Read the resolved payload via useNuxtData (the projectSettings plugin
  // awaited useProjectSettingsData during SSR). A setup-captured
  // useProjectSettingsData().data ref stayed on its `default: null` in page
  // setups, so dashboard SEO copy and per-page OG overrides were silently
  // dropped in favour of the baked content.js / Takumi fallbacks.
  const { data: projectSettings } = useNuxtData("project-settings");

  // `site_config.copy.pages[pageKey]` is a per-locale map - the backend
  // returns every saved locale in one response because the shared
  // `useProjectSettingsData()` fetch above must stay locale-agnostic (it also
  // runs inside the `projectSettings` plugin's setup(), where `useI18n()` is
  // not valid - see that composable's docblock). The current locale is
  // picked HERE instead, inside `usePageMeta`'s own setup() call (this
  // composable is only ever invoked from a page/component's setup()), where
  // `useI18n()` IS valid. The projectSettings plugin awaits the underlying
  // fetch before page setup runs, so `projectSettings.value` is already
  // resolved (not a pending promise) here during SSR - same precedent as
  // `apiOg` below.
  const dashboardCopy = pageKey
    ? (projectSettings.value?.data?.settings?.site_config?.copy?.pages?.[pageKey]?.[locale.value] ?? null)
    : null;

  // Precedence: an explicit per-call override (e.g. a blog post's own title,
  // a brand's own name) > dashboard-managed copy > baked content.js value.
  // Overrides always win because they represent a specific entity's identity,
  // not generic page-level copy - a dashboard edit to "Brands" page meta must
  // never shadow an individual brand detail page's own title.
  const title = computed(
    () => toValue(overrides.title) || dashboardCopy?.title || meta.value?.title || "",
  );
  const description = computed(
    () => toValue(overrides.description) || dashboardCopy?.description || meta.value?.description || "",
  );

  // Per-page OG overrides managed in PM One (project settings -> OG Images).
  const ogKey = pageKey ? OG_KEY_MAP[pageKey] || pageKey : null;
  const apiOg = ogKey
    ? (projectSettings.value?.data?.settings?.og_pages?.[ogKey] ?? null)
    : null;

  const ogTitle = computed(() => apiOg?.title || title.value);
  const ogDescription = computed(() => apiOg?.description || description.value);

  useSeoMeta({
    titleTemplate: computed(() => meta.value?.withoutTitleTemplate ? "%s" : "%s · %siteName"),
    title: title,
    ogTitle: ogTitle,
    description: description,
    ogDescription: ogDescription,
    ogUrl: useAppConfig().app.url + route.path,
    twitterCard: "summary_large_image",
    twitterTitle: ogTitle,
    twitterDescription: ogDescription,
  });

  // Precedence: PM One project OG image > page-local override (e.g. a post's
  // og_image from the API) > content-store static image > generated Takumi card.
  const ogImageUrl = apiOg?.image?.url || toValue(overrides.ogImage) || meta.value?.ogImage;

  if (ogImageUrl) {
    useSeoMeta({
      ogImage: ogImageUrl,
      twitterImage: ogImageUrl,
      ...(apiOg?.image?.url
        ? {
            ogImageWidth: apiOg.image.width ?? 1200,
            ogImageHeight: apiOg.image.height ?? 630,
          }
        : {}),
    });
  } else {
    // Sanitize values for OG image URL to prevent unsafe attribute errors.
    // nuxt-og-image v6 uses comma-separated URL params and doesn't properly
    // encode special characters (?,!,commas) which breaks Vue server renderer.
    const sanitize = (val) => (val || "").replace(/[?,!]/g, "").replace(/,/g, " ");
    const ogTitle = computed(() => sanitize(toValue(title)));
    const ogDescription = computed(() => sanitize(toValue(description)));

    if (import.meta.dev) {
      useState(`og-image:ssr-exists:${route.path}`, () => false).value = true;
    }
    defineOgImage("Page", {
      headline: useAppConfig().app.name,
      pageTitle: ogTitle,
      pageDescription: ogDescription,
      title: ogTitle,
      description: ogDescription,
    });
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: useAppConfig().app.name,
    url: useAppConfig().app.url,
    alternateName: useAppConfig().app.name,
  };

  useHead({
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(structuredData),
      },
    ],
  });

  return { title, description };
};
