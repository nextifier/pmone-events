export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return await pmOnePublicFetch("/reservations/preview-pricing", {
    method: "POST",
    body,
    errorShape: "statusMessage",
    errorPrefix: "Preview",
  });
});
