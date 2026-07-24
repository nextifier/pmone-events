/**
 * Revert (delete) a temp file upload for a public form (/forms/{slug}/upload).
 *
 * PM One's revert reads the folder id from the raw request body (text/plain),
 * so forward it verbatim with the X-API-Key. Never cached.
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") ?? "";
  const id = await readRawBody(event, "utf8");

  return await pmOneFetch(`/forms/${encodeURIComponent(slug)}/upload`, {
    method: "DELETE",
    body: id,
    headers: { "Content-Type": "text/plain" },
    errorPrefix: "Could not remove file",
  });
});
