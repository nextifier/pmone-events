export default defineEventHandler(async (event) => {
  const eventSlug = getRouterParam(event, "eventSlug") ?? "";
  const hotelSlug = getRouterParam(event, "hotelSlug") ?? "";

  return await pmOnePublicFetch(
    `/events/${encodeURIComponent(eventSlug)}/hotels/${encodeURIComponent(hotelSlug)}`,
    { errorShape: "statusMessage", errorPrefix: "Hotel fetch" },
  );
});
