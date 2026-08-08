import { defineSitemapEventHandler } from "#imports";

interface BlogPost {
  slug: string;
  updated_at: string;
}

interface BlogResponse {
  data: BlogPost[];
}

interface BrandSitemapEntry {
  slug: string;
  updated_at?: string | null;
}

interface BrandSitemapResponse {
  data: BrandSitemapEntry[];
  /**
   * How many slugs each resolution source contributed. Read on purpose: an
   * empty `data` alongside non-zero counts is the one signal that separates
   * "this site genuinely has no brands" from "something upstream broke".
   */
  meta?: {
    sources?: {
      active: number;
      conjunction: number;
      previous_edition: number;
    };
  };
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
 * Both upstream fetches can pull a thousand rows; cache them for an hour so
 * repeated sitemap crawls don't re-fetch and re-parse the whole payload every
 * time.
 *
 * WHAT THIS CACHE DOES NOT PROTECT YOU FROM: only a THROWN failure escapes it.
 * A 200 carrying an empty array is a success, so an upstream that quietly stops
 * returning rows gets that emptiness cached for the full hour, and the caller's
 * try/catch never sees a thing. That is exactly how every /brands/ URL stayed
 * missing from these sitemaps between the June edition rollover and 8 Aug 2026.
 * Each fetch now has to notice its own silence — see fetchBrandUrls below.
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

/**
 * Brands come from /brands-sitemap, NOT from the /brands listing.
 *
 * WHY THE DISTINCTION MATTERS: brand DETAIL resolves three sources in order —
 * the active event, its conjunction events, then any published previous edition.
 * The listing only ever sees the first. While this file used the listing, eight
 * sites shipped sitemaps that either had no brand URL at all (franchise-expo,
 * indonesiacomiccon, indooutingexpo and the four cbe-backed sites, whose active
 * editions have no brands attached yet) or silently dropped their conjunction
 * partners' (morefoodexpo, keramika, megabuild). Measured 8 Aug 2026: roughly
 * 1,700 pages answering 200 that Google had no way to reach, because /brands
 * renders client-side and its HTML carries no brand links — the sitemap is the
 * ONLY discovery path these URLs have.
 *
 * `/brands-sitemap` mirrors the detail resolver deliberately, and returns slug +
 * timestamp only: the listings carry media, tags and promotion posts, which is
 * 1.35 MB for morefoodexpo and nothing a sitemap can use.
 */
const fetchBrandUrls = defineCachedFunction(
  async (): Promise<SitemapEntry[]> => {
    const brands = await pmOneFetch<BrandSitemapResponse>("/brands-sitemap", {
      query: { fallback: dataFallbackFlag("brands") },
      allowedQueryKeys: ["fallback"],
      errorPrefix: "Sitemap brands",
    });

    const entries = brands?.data || [];
    const sources = brands?.meta?.sources;
    const reported = sources
      ? sources.active + sources.conjunction + sources.previous_edition
      : 0;

    if (!entries.length && reported > 0) {
      console.warn(
        `[sitemap-urls] /brands-sitemap reported ${reported} brands ` +
          `(${JSON.stringify(sources)}) but sent none — every /brands/ URL will ` +
          "be missing from this sitemap for the next hour.",
      );
    }

    return entries.map((brand) => ({
      loc: `/brands/${brand.slug}`,
      lastmod: brand.updated_at || undefined,
      _i18nTransform: true as const,
    }));
  },
  {
    name: "sitemap-brands",
    maxAge: 3600,
    // The flag is constant per deployment, but keying on it costs nothing and
    // stops a future dynamic value from being served someone else's answer.
    getKey: () => `fallback-${dataFallbackFlag("brands")}`,
  },
);

export default defineSitemapEventHandler(async () => {
  const urls: SitemapEntry[] = [];

  // ----- Blog posts (news) -----
  try {
    urls.push(...(await fetchBlogUrls()));
  } catch (error) {
    console.error("[sitemap-urls] failed to fetch blog posts:", error);
  }

  // ----- Brands (every /brands/[slug] the API will answer 200 for) -----
  // Decouples SEO discovery of /brands/[slug] from the listing DOM, so the
  // listing can render client-side (virtualized) without losing crawlability.
  try {
    urls.push(...(await fetchBrandUrls()));
  } catch (error) {
    console.error("[sitemap-urls] failed to fetch brands:", error);
  }

  return urls;
});
