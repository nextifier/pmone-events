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

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig();
  const urls: { loc: string; lastmod?: string }[] = [];

  // ----- Blog posts (news) -----
  try {
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

    urls.push(
      ...response.data.map((post) => ({
        loc: `/news/${post.slug}`,
        lastmod: post.updated_at,
      })),
    );
  } catch (error) {
    console.error("[sitemap-urls] failed to fetch blog posts:", error);
  }

  // ----- Brands (primary event) -----
  // Decouples SEO discovery of /brands/[slug] from the listing DOM, so the
  // listing can render client-side (virtualized) without losing crawlability.
  try {
    const brands = await pmOneFetch<BrandResponse>("/brands", {
      query: { per_page: 1000 },
      allowedQueryKeys: ["per_page"],
      errorPrefix: "Sitemap brands",
    });

    urls.push(
      ...(brands?.data || []).map((brand) => ({
        loc: `/brands/${brand.slug}`,
        lastmod: brand.updated_at || brand.created_at,
      })),
    );
  } catch (error) {
    console.error("[sitemap-urls] failed to fetch brands:", error);
  }

  return urls;
});
