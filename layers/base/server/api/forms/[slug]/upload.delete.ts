/**
 * Revert (delete) a temp file upload for a public form (/forms/{slug}/upload).
 *
 * PM One's revert reads the folder id from the raw request body (text/plain),
 * so forward it verbatim with the X-API-Key. Never cached.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const appConfig = useAppConfig();
  const slug = getRouterParam(event, "slug");

  const username =
    appConfig.app.dataSourceUsername || appConfig.app.projectUsername;
  const baseUrl = (config.public as any).apiUrl || "http://localhost:8000";
  const apiKey = (config as any).pmOneApiKey;

  const id = await readRawBody(event, "utf8");

  try {
    return await $fetch(
      `${baseUrl}/api/public/projects/${username}/forms/${slug}/upload`,
      {
        method: "DELETE",
        body: id,
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
          "Content-Type": "text/plain",
        },
      },
    );
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 500,
      message: error.data?.message || error.message || "Could not remove file",
      data: error.data,
    });
  }
});
