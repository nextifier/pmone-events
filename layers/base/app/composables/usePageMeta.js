// Content-store page keys -> canonical PM One OG page keys (kebab-case).
const OG_KEY_MAP = { bookSpace: "book-space", ticket: "tickets" };

export const usePageMeta = (pageKey, overrides = {}) => {
  const pageStore = useContentStore();
  const route = useRoute();

  const meta = computed(() => pageKey ? pageStore.getMetaByKey(pageKey) : null);

  // Precedence: an explicit per-call override (e.g. a blog post's own title, a
  // brand's own name) > the baked content.js value. Overrides always win
  // because they represent a specific entity's identity, not page-level copy.
  //
  // A dashboard-managed middle layer (`site_config.copy`) existed briefly and
  // was removed in Aug 2026 along with the rest of the website-settings
  // pipeline. Its `website_copy` table never had a single row in production.
  const title = computed(
    () => toValue(overrides.title) || meta.value?.title || "",
  );
  const description = computed(
    () => toValue(overrides.description) || meta.value?.description || "",
  );

  // Per-page OG overrides, still managed in PM One (project settings -> SEO).
  // Read at ACCESS time via useNuxtData: the ogPages plugin awaited the fetch
  // during SSR, whereas a setup-captured ref would return its `default: null`
  // here and silently drop every dashboard OG image.
  const ogKey = pageKey ? OG_KEY_MAP[pageKey] || pageKey : null;
  const apiOg = ogKey
    ? (useNuxtData("og-pages").data.value?.data?.[ogKey] ?? null)
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

  // Precedence: dashboard OG image > page-local override (e.g. a post's
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
    // No sanitizing here: nuxt-og-image v6.7 base64-encodes any param value
    // whose encodeURIComponent output contains a `%` (urlEncoding.js:147-156),
    // so commas, `?` and `!` round-trip intact. Stripping them only mangled the
    // card copy — "HEX, RGB, HSL" came out as "HEX RGB HSL". Removing it also
    // drops a local `ogTitle`/`ogDescription` pair that shadowed the ones
    // computed from `apiOg` above, so the generated card now honours the
    // dashboard-managed OG copy instead of silently falling back to the page
    // title/description.
    if (import.meta.dev) {
      useState(`og-image:ssr-exists:${route.path}`, () => false).value = true;
    }
    defineOgImage("Page", {
      pageTitle: ogTitle,
      pageDescription: ogDescription,
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
