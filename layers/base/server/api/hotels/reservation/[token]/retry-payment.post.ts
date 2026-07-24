export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, "token") ?? "";

  return await pmOnePublicFetch(
    `/reservations/magic/${encodeURIComponent(token)}/retry-payment`,
    {
      method: "POST",
      // Mints a fresh payment session upstream, same as book.post.ts.
      timeoutMs: 30000,
      errorShape: "statusMessage",
      errorPrefix: "Retry",
    },
  );
});
