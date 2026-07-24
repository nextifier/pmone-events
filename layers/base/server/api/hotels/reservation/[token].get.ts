export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token") ?? "";

  return await pmOnePublicFetch(
    `/reservations/magic/${encodeURIComponent(token)}`,
    {
      errorShape: "statusMessage",
      errorPrefix: "This link is invalid or has expired",
    },
  );
});
