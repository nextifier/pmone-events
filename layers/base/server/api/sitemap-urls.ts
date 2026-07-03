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

/**
 * Both upstream fetches pull up to 1000 rows each; cache them for an hour so
 * repeated sitemap crawls don't re-fetch + re-parse the full payload every
 * time. Failures throw (handled by the caller) so an empty result is never
 * cached for the full TTL.
 */
const fetchBlogUrls = defineCachedFunction(
  async (): Promise<{ loc: string; lastmod?: string }[]> => {
    const config = useRuntimeConfig();
    const response = await $fetch<BlogResponse>(
      `${config.public.apiUrl}/api/public/blog/posts`,
      {
        headers: {
          "X-API-Key": config.pmOneApiKey,
          Accept: "application/json",
        },
        query: {
          per_page: 1000,
          sort: "-published_at",
          author: config.public.blogUsernames,
        },
        timeout: 15000,
      },
    );

    return response.data.map((post) => ({
      loc: `/news/${post.slug}`,
      lastmod: post.updated_at,
    }));
  },
  { name: "sitemap-blog", maxAge: 3600, getKey: () => "default" },
);

const fetchBrandUrls = defineCachedFunction(
  async (): Promise<{ loc: string; lastmod?: string }[]> => {
    const brands = await pmOneFetch<BrandResponse>("/brands", {
      query: { per_page: 1000 },
      allowedQueryKeys: ["per_page"],
      errorPrefix: "Sitemap brands",
    });

    return (brands?.data || []).map((brand) => ({
      loc: `/brands/${brand.slug}`,
      lastmod: brand.updated_at || brand.created_at,
    }));
  },
  { name: "sitemap-brands", maxAge: 3600, getKey: () => "default" },
);

export default defineSitemapEventHandler(async () => {
  const urls: { loc: string; lastmod?: string }[] = [];

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
