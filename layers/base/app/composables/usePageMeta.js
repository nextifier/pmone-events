// Content-store page keys -> canonical PM One OG page keys (kebab-case).
const OG_KEY_MAP = { bookSpace: "book-space", ticket: "tickets" };

export const usePageMeta = (pageKey, overrides = {}) => {
  const pageStore = useContentStore();
  const route = useRoute();

  const meta = computed(() => pageKey ? pageStore.getMetaByKey(pageKey) : null);

  // Support both plain values and computed/ref values
  const title = computed(() => toValue(overrides.title) || meta.value?.title || "");
  const description = computed(() => toValue(overrides.description) || meta.value?.description || "");

  // Per-page OG overrides managed in PM One (project settings -> OG Images).
  // The projectSettings server plugin awaits this payload before page setup,
  // so it is readable synchronously here during SSR.
  const ogKey = pageKey ? OG_KEY_MAP[pageKey] || pageKey : null;
  const { data: projectSettings } = useProjectSettingsData();
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
