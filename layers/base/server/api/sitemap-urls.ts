import { defineSitemapEventHandler } from "#imports";

interface BlogPost {
  slug: string;
  updated_at: string;
}

interface BlogResponse {
  data: BlogPost[];
}

export default defineSitemapEventHandler(async () => {
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
    },
  );

  const posts = response.data.map((post) => ({
    loc: `/news/${post.slug}`,
    lastmod: post.updated_at,
  }));

  return [...posts];
});
