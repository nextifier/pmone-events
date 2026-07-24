export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return await pmOnePublicFetch("/hotels/availability", {
    method: "POST",
    body,
    errorShape: "statusMessage",
    errorPrefix: "Availability",
  });
});
