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
  });

  if (meta.value?.ogImage) {
    defineOgImage({
      url: meta.value.ogImage,
    });
  } else {
    defineOgImageComponent("Page", {
      headline: useAppConfig().app.name,
      title: title.value,
      description: description.value,
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
