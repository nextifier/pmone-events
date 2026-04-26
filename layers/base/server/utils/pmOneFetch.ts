interface PmOneFetchOptions {
  query?: Record<string, any>;
  allowedQueryKeys?: string[];
  timeoutMs?: number;
  errorPrefix?: string;
}

export async function pmOneFetch<T = any>(
  path: string,
  opts: PmOneFetchOptions = {},
): Promise<T> {
  const config = useRuntimeConfig();
  const appConfig = useAppConfig();

  const username =
    appConfig.app.dataSourceUsername || appConfig.app.projectUsername;
  const url = `${config.public.apiUrl}/api/public/projects/${username}${path}`;

  const allowedKeys = opts.allowedQueryKeys;
  const filteredQuery = allowedKeys
    ? Object.fromEntries(
        Object.entries(opts.query ?? {}).filter(([k]) =>
          allowedKeys.includes(k),
        ),
      )
    : opts.query ?? {};

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? 15000,
  );

  try {
    return (await $fetch(url, {
      headers: {
        "X-API-Key": config.pmOneApiKey,
        Accept: "application/json",
      },
      query: filteredQuery,
      signal: controller.signal,
    })) as T;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw createError({
        statusCode: 504,
        message: "Request timeout - API server took too long to respond",
      });
    }
    throw createError({
      statusCode: error.response?.status || 500,
      message:
        error.message ||
        (opts.errorPrefix ? `${opts.errorPrefix} failed` : "Upstream fetch failed"),
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
