/** The signed-in visitor's meetings at this event. */
export default defineEventHandler(async (event) => {
  const slug = encodeURIComponent(getRouterParam(event, "eventSlug") ?? "");
  return visitorFetch(event, `/events/${slug}/me/meetings`);
});
