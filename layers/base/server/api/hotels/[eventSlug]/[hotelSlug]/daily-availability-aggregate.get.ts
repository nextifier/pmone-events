export default defineEventHandler(async (event) => {
  const eventSlug = getRouterParam(event, "eventSlug") ?? "";
  const hotelSlug = getRouterParam(event, "hotelSlug") ?? "";
  const query = getQuery(event);

  return await pmOnePublicFetch(
    `/events/${encodeURIComponent(eventSlug)}/hotels/${encodeURIComponent(hotelSlug)}/daily-availability-aggregate`,
    {
      // The calendar sends a date window; allowlisted rather than forwarding the
      // raw client query.
      query: { start_date: query.start_date, end_date: query.end_date },
      allowedQueryKeys: ["start_date", "end_date"],
      errorShape: "statusMessage",
      errorPrefix: "Availability fetch",
    },
  );
});
