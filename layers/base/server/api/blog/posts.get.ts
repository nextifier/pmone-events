export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const data = await $fetch(
        `${config.public.apiUrl}/api/public/blog/posts`,
        {
          headers: {
            "X-API-Key": config.pmOneApiKey, // Private - not exposed to browser
            Accept: "application/json",
          },
          query: {
            per_page: query.per_page || 100,
            sort: query.sort || "-published_at",
            author: query.author || config.public.blogUsernames,
            ...query, // Forward any additional query params
          },
          signal: controller.signal,
        },
      );

      return trimListPayload(data);
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw createError({
          statusCode: 504,
          message: "Request timeout - API server took too long to respond",
        });
      }
      throw createError({
        statusCode: error.response?.status || 500,
        message: error.message || "Failed to fetch posts",
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    name: "api-blog-posts",
    maxAge: 15,
    swr: true,
    getKey: (event) => {
      const q = getQuery(event);
      return (
        Object.entries(q)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}=${v}`)
          .join("&") || "default"
      );
    },
  },
);

/**
 * Strip list items down to what the cards actually render.
 *
 * The upstream list response was ~110 KB for 50 posts, and 70+ KB of it was
 * never read: every item shipped 5 responsive variants of featured_image plus
 * Laravel pivot/audit fields, and each author a full image set. The list's
 * consumers (PostSlider + /news index, both via the posts store) read exactly
 * the fields kept below — measured by grepping `post.*` / `author.*` usage on
 * 24 Jul 2026. The DETAIL route ([slug].get.ts) is untouched and still returns
 * everything, so article pages lose nothing.
 *
 * Deliberately tolerant: anything with an unexpected shape passes through
 * unchanged rather than risk breaking the page over a missing field.
 */
function trimListPayload(payload: any) {
  if (!payload || !Array.isArray(payload.data)) {
    return payload;
  }

  const pickImage = (img: any) =>
    img && typeof img === "object"
      ? {
          url: img.url,
          alt: img.alt,
          caption: img.caption,
          width: img.width,
          height: img.height,
          lqip: img.lqip,
          lg: img.lg,
        }
      : img;

  const pickAuthorImage = (img: any) =>
    img && typeof img === "object"
      ? { url: img.url, original: img.original, alt: img.alt, sm: img.sm, lqip: img.lqip }
      : img;

  return {
    ...payload,
    data: payload.data.map((post: any) =>
      post && typeof post === "object"
        ? {
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            published_at: post.published_at,
            reading_time: post.reading_time,
            tags: post.tags,
            featured_image: pickImage(post.featured_image),
            authors: Array.isArray(post.authors)
              ? post.authors.map((a: any) =>
                  a && typeof a === "object"
                    ? {
                        id: a.id,
                        name: a.name,
                        username: a.username,
                        website: a.website,
                        profile_image: pickAuthorImage(a.profile_image),
                      }
                    : a,
                )
              : post.authors,
          }
        : post,
    ),
  };
}
