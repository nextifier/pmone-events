export const usePageMeta = (pageKey, overrides = {}) => {
  const pageStore = useContentStore();
  const route = useRoute();

  const meta = computed(() => pageKey ? pageStore.getMetaByKey(pageKey) : null);

  // Support both plain values and computed/ref values
  const title = computed(() => toValue(overrides.title) || meta.value?.title || "");
  const description = computed(() => toValue(overrides.description) || meta.value?.description || "");

  useSeoMeta({
    titleTemplate: computed(() => meta.value?.withoutTitleTemplate ? "%s" : "%s · %siteName"),
    title: title,
    ogTitle: title,
    description: description,
    ogDescription: description,
    ogUrl: useAppConfig().app.url + route.path,
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: description,
  });

  if (meta.value?.ogImage) {
    useSeoMeta({
      ogImage: meta.value.ogImage,
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
