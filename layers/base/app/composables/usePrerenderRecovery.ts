import type { Ref } from "vue";

/**
 * How long a page that already reloaded to recover must wait before it may do
 * it again.
 */
const RELOAD_GUARD_MS = 5 * 60 * 1000;

/**
 * One full page load, at most once per five minutes per scope and tab.
 *
 * WHY A FULL LOAD RECOVERS WHAT A FETCH CANNOT. The pages that use this are
 * prerendered, so Cloudflare Static Assets serves their HTML without touching
 * the Worker or PM One, and that HTML already carries the data. A visitor who
 * arrives by client-side navigation never receives that HTML: the page is
 * assembled in the browser, asks PM One for its data, and ends empty when PM
 * One is unreachable. Asking the browser for the PAGE again gets the data
 * back. Reproduced 1 Oct 2026 on production with /api/* blocked: Home ->
 * Tickets showed "Couldn't load tickets", Home -> Gallery showed no photos.
 *
 * The guard keeps a page that fails the same way on a full load (not
 * prerendered, or PM One down at build time) from reloading in a loop; it ends
 * on its ordinary empty or error state instead. Storage that throws (private
 * windows) disables the reload rather than risk the loop.
 */
export function reloadOnceToRecover(scope: string): void {
  if (!import.meta.client) return;

  const key = `recovery-reload:${scope}`;

  try {
    const last = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - last < RELOAD_GUARD_MS) return;
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    return;
  }

  window.location.reload();
}

/**
 * Reload once when the request failed AND there is nothing on screen to keep.
 * `skip` lets a caller rule out failures that are not outages (staff preview,
 * "ticketing is not enabled").
 */
export function useReloadWhenEmpty(
  error: Ref<unknown>,
  hasData: () => boolean,
  scope: string,
  skip: () => boolean = () => false,
): void {
  watch(
    error,
    (failure) => {
      if (!failure || hasData() || skip()) return;
      reloadOnceToRecover(scope);
    },
    { immediate: true },
  );
}

interface RefreshableData<T> {
  data: Ref<T | null | undefined>;
  error: Ref<unknown>;
  refresh: () => Promise<unknown>;
}

/**
 * Keep a prerendered page live: once the page is interactive, ask PM One for
 * the current data, and keep what the build baked in if that fails.
 *
 * Only when the page was hydrated from prerendered HTML. A page rendered by the
 * Worker already has current data, and a client-side navigation has just
 * fetched it.
 *
 * `useFetch` empties `data` the moment a request fails (see the note in
 * useasyncdata-error-clears-data), which would turn "PM One is slow" into a
 * blank page, so the copy on screen is put back and the error cleared.
 *
 * Callers must not show a skeleton for `pending` while data is present, or
 * every visit flashes one when this refresh runs.
 */
export function useRefreshAfterPrerender<T>(source: RefreshableData<T>): void {
  if (!import.meta.client) return;

  const nuxtApp = useNuxtApp();
  if (!nuxtApp.isHydrating || !nuxtApp.payload.prerenderedAt) return;

  onNuxtReady(async () => {
    const kept = source.data.value;
    await source.refresh();

    if (source.error.value && kept != null) {
      source.data.value = kept;
      source.error.value = undefined;
    }
  });
}
