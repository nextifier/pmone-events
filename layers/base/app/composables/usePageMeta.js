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

  // The generated social card falls back to English for Chinese, Japanese and
  // Korean.
  //
  // The only font registered with @nuxt/fonts is MinusOne, a Latin-only brand
  // face, so the renderer has no CJK glyphs and drew those titles as rows of
  // empty boxes. Giving it real CJK fonts was tried twice — `ogImage.fontSubsets`
  // and naming Noto faces in `--font-sans` — and both shipped to production
  // without changing a single byte of the rendered card. English copy is a worse
  // card than a translated one and a far better card than tofu.
  //
  // This affects ONLY the generated image. The page's own <title>, og:title and
  // description above stay in the visitor's language, which is what search
  // engines and the page itself need.
  // The test is on the TEXT, not on the locale. Asking i18n for the English
  // message instead was tried first and shipped to production doing nothing:
  // messages are lazy-loaded per locale, so during a zh render the "en" bundle
  // is not in memory and the lookup silently returned the Chinese string back.
  // A regex over characters the font cannot draw is the one check that cannot
  // fail quietly — and it also catches CJK arriving from the API (a blog post
  // title), which no i18n lookup could have helped with.
  const RE_UNRENDERABLE = /[぀-ヿ㐀-䶿一-鿿가-힯]/;
  const appName = useAppConfig().app.name;

  const cardTitle = computed(() =>
    RE_UNRENDERABLE.test(ogTitle.value || "") ? appName : ogTitle.value,
  );

  // Dropped rather than substituted: the card already prints the site name and
  // domain at the bottom, so repeating either as the body reads like a bug. A
  // title-only card is what the template does for pages with no description.
  const cardDescription = computed(() =>
    RE_UNRENDERABLE.test(ogDescription.value || "") ? "" : ogDescription.value,
  );

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
      pageTitle: cardTitle,
      pageDescription: cardDescription,
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
