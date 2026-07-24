export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return await pmOnePublicFetch("/promo-codes/validate", {
    method: "POST",
    body,
    errorShape: "statusMessage",
    errorPrefix: "Validation",
  });
});
