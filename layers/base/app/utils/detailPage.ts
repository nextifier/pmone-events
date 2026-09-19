/**
 * Guard for pages that resolve a single record and 404 when it is missing.
 *
 * `useFetch` never rejects. A failed request populates `error` and leaves
 * `data` at its default, so the obvious `if (!record) throw createError(404)`
 * cannot tell "this article does not exist" from "the API did not answer".
 *
 * That distinction is load-bearing, because server/plugins/cacheControl.ts
 * stores any 404 render in the edge cache under NOT_FOUND_TTL - one hour. On
 * 19 Sep 2026 an API outage therefore became hour-long 404s on every news and
 * hotel URL a visitor happened to open while it lasted, persisting long after
 * the API recovered and unfixable by a deploy, since a build needs the same API.
 *
 * So: a genuine upstream 404 stays a 404 and stays cacheable, while a transport
 * failure surfaces as 5xx, which cacheControl declines to store and which the
 * next visit retries.
 */
type DetailPageFetchError = {
  statusCode?: number | string | null;
  status?: number | string | null;
} | null | undefined;

type DetailPageGuard = {
  /** The resolved record, or null/undefined when the payload carried none. */
  record: unknown;
  /** `error.value` from the useFetch/useAsyncData call that loaded it. */
  error: DetailPageFetchError;
  /** `pending.value`, when the call can still be in flight. */
  pending?: boolean;
  /** statusMessage for the genuine 404, e.g. "Article not found". */
  notFound: string;
};

export function assertDetailPageLoaded({
  record,
  error,
  pending = false,
  notFound,
}: DetailPageGuard): void {
  if (pending) {
    return;
  }

  if (error) {
    const status = Number(error.statusCode ?? error.status ?? 0);

    // The record really is gone. Let it 404 and let the edge remember that.
    if (status === 404 || status === 410) {
      throw createError({ statusCode: 404, statusMessage: notFound });
    }

    // Anything else - 5xx, a 504 from pmOneFetch's abort, a transport error
    // that never got a status - is about the API, not about this URL.
    throw createError({
      statusCode: status >= 500 && status <= 599 ? status : 503,
      statusMessage: "Temporarily unavailable",
      fatal: true,
    });
  }

  if (!record) {
    throw createError({ statusCode: 404, statusMessage: notFound });
  }
}
