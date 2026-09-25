/** Exhibitors matching the signed-in visitor's checkout answers. */
export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, "eventSlug") ?? "");
  return visitorFetch(event, `/events/${slug}/me/meeting-suggestions`);
});
