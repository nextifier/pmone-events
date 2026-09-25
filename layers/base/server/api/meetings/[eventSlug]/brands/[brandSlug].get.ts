/**
 * An exhibitor's meeting slots. Per visitor: a signed-in ticket holder sees
 * their own request and clashes on the grid, so this is never cached.
 */
export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, "eventSlug") ?? "");
  const brand = encodeURIComponent(getRouterParam(event, "brandSlug") ?? "");
  return visitorFetch(event, `/events/${slug}/brands/${brand}/meetings`);
});
