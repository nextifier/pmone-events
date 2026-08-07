/**
 * Per-section `?fallback=0|1` flags for the PM One public endpoints.
 *
 * When an active event has no content of its own, the API may borrow the most
 * recent previous edition's. Whether it should is an editorial decision, so it
 * lives in each app's `app.config.settings.dataFallback` and travels with the
 * request instead of being read from a dashboard row.
 *
 * Sent as 0/1 rather than a boolean because query serialisation turns `false`
 * into the string "false", which PHP's `boolean()` reads as false anyway but
 * makes the cache key harder to read.
 */
export function useDataFallback() {
  const { dataFallback } = useAppConfig().settings;

  return Object.fromEntries(
    Object.entries(dataFallback).map(([key, on]) => [key, on ? 1 : 0]),
  ) as Record<keyof typeof dataFallback, 0 | 1>;
}
