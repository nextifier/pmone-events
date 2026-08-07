/**
 * Nitro cache TTL for the PM One proxy handlers.
 *
 * 15s at runtime: the budget for a dashboard publish to reach visitors.
 *
 * 1h during prerender. `import.meta.prerender` is replaced with a literal at
 * compile time, so the Worker bundle still ships `15` and only the throwaway
 * nitro-prerender bundle sees `3600`. That bundle's `cache` storage is
 * in-memory and lives exactly as long as the build (Nitro only mounts the fs
 * devStorage when `options.dev`), so a raised TTL collapses each cache key to
 * ONE upstream call for the whole run instead of one every 15s across ~1,400
 * prerendered routes — and nothing is left behind to stale the next build.
 */
export const API_MAX_AGE = import.meta.prerender ? 3600 : 15;

/**
 * Upstream timeout for the handlers that must degrade rather than stall.
 *
 * 3s at runtime so a PM One outage cannot hold a render hostage. At build time
 * that same 3s would bake an error state into every prerendered page, which is
 * far worse than a slow build — so prerender waits.
 */
export const API_TIMEOUT_MS = import.meta.prerender ? 45000 : 3000;
