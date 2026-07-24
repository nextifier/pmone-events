export default defineEventHandler(async (event) => {
  const number = getRouterParam(event, "number") ?? "";

  return await pmOnePublicFetch(
    `/reservations/status/${encodeURIComponent(number)}`,
    { errorShape: "statusMessage", errorPrefix: "Reservation not found" },
  );
});
