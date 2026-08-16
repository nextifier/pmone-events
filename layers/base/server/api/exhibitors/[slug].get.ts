export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  return pmOneFetch(`/brands/${slug}`, {
    // Mirrors the home-page teaser: when the teaser may borrow a previous
    // edition's brands, the detail pages those cards link to must resolve too.
    // `settings.dataFallback.brands` off means the link 404s instead of showing
    // an exhibitor who is not actually at this edition.
    query: {
      fallback: dataFallbackFlag("brands"),
      // Without this, a brand opened from a force-shown listing would 404.
      ...adminPreviewFlag(event, "force_show_brands"),
    },
    errorPrefix: "Fetch brand",
  });
});
