import { defineSitemapEventHandler } from "#imports";

interface BlogPost {
  slug: string;
  updated_at: string;
}

interface BlogResponse {
  data: BlogPost[];
}

interface Brand {
  slug: string;
  updated_at?: string;
  created_at?: string;
}

interface BrandResponse {
  data: Brand[];
}

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  /**
   * Expand this URL across every configured locale, with a full hreflang block.
   *
   * WHY IT IS NOT OPTIONAL: without it @nuxtjs/sitemap emits each of these URLs
   * once, into the default-locale sitemap only, with alternates listing just
   * `x-default` and `en-US`. Measured on megabuild.co.id on 6 Aug 2026 that was
   * 283 of 309 URLs — Google was being told, explicitly, that no Indonesian
   * version of any article or brand page existed, and /id/news/* was submitted
   * in no sitemap at all. That is why Indonesian searchers stopped landing on
   * the Indonesian pages.
   */
  _i18nTransform: true;
}

/**
 * Both upstream fetches pull up to 1000 rows each; cache them for an hour so
 * repeated sitemap crawls don't re-fetch + re-parse the full payload every
 * time. Failures throw (handled by the caller) so an empty result is never
 * cached for the full TTL.
 */
const fetchBlogUrls = defineCachedFunction(
  async (): Promise<SitemapEntry[]> => {
    const config = useRuntimeConfig();
    const response = await pmOnePublicFetch<BlogResponse>("/blog/posts", {
      query: {
        per_page: 1000,
        sort: "-published_at",
        author: config.public.blogUsernames,
      },
      errorPrefix: "Sitemap posts",
    });

    return response.data.map((post) => ({
      loc: `/news/${post.slug}`,
      lastmod: post.updated_at,
      _i18nTransform: true as const,
    }));
  },
  { name: "sitemap-blog", maxAge: 3600, getKey: () => "default" },
);

const fetchBrandUrls = defineCachedFunction(
  async (): Promise<SitemapEntry[]> => {
    const brands = await pmOneFetch<BrandResponse>("/brands", {
      query: { per_page: 1000 },
      allowedQueryKeys: ["per_page"],
      errorPrefix: "Sitemap brands",
    });

    return (brands?.data || []).map((brand) => ({
      loc: `/brands/${brand.slug}`,
      lastmod: brand.updated_at || brand.created_at,
      _i18nTransform: true as const,
    }));
  },
  { name: "sitemap-brands", maxAge: 3600, getKey: () => "default" },
);

export default defineSitemapEventHandler(async () => {
  const urls: SitemapEntry[] = [];

  // ----- Blog posts (news) -----
  try {
    urls.push(...(await fetchBlogUrls()));
  } catch (error) {
    console.error("[sitemap-urls] failed to fetch blog posts:", error);
  }

  // ----- Brands (primary event) -----
  // Decouples SEO discovery of /brands/[slug] from the listing DOM, so the
  // listing can render client-side (virtualized) without losing crawlability.
  try {
    urls.push(...(await fetchBrandUrls()));
  } catch (error) {
    console.error("[sitemap-urls] failed to fetch brands:", error);
  }

  return urls;
});
