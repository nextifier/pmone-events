/** Upper bound on `per_page`. /news pages 50 at a time; the sitemap uses its own fetch. */
const MAX_PER_PAGE = 100;

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event);

    const perPage = Math.min(
      Math.max(Number(query.per_page) || 50, 1),
      MAX_PER_PAGE,
    );

    return await pmOnePublicFetch("/blog/posts", {
      query: {
        page: query.page,
        per_page: perPage,
        sort: query.sort || "-published_at",
        search: query.search,
        locale: query.locale,
        // NEVER from the client. This used to be `...query` spread AFTER the
        // defaults, so a visitor could set ?author=<other-project> and pull a
        // different project's posts through this site — and every distinct
        // query string became its own cache entry.
        author: config.public.blogUsernames,
      },
      allowedQueryKeys: [
        "page",
        "per_page",
        "sort",
        "search",
        "locale",
        "author",
      ],
      errorPrefix: "Posts fetch",
    });
  },
  {
    name: "api-blog-posts",
    maxAge: 15,
    // NOT swr. A stale payload here fossilises: SSR renders the old data into
    // HTML that is then edge-cached for days. See cf-cache-rules.ts.
    swr: false,
    getKey: (event) => {
      const q = getQuery(event);
      // Only the keys the handler actually forwards, so the key space is finite.
      return ["page", "per_page", "sort", "search", "locale"]
        .map((k) => `${k}=${q[k] ?? ""}`)
        .join("&");
    },
  },
);
