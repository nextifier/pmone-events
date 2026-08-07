interface PmOneRequestOptions {
  query?: Record<string, any>;
  /**
   * Whitelist of query keys forwarded upstream. Without it the caller's query
   * object is sent as-is — only do that for values the route built itself,
   * never for a raw getQuery(event).
   */
  allowedQueryKeys?: string[];
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: any;
  /** Extra request headers, e.g. forwarding the visitor's IP / User-Agent. */
  headers?: Record<string, string>;
  timeoutMs?: number;
  responseType?: "json" | "arrayBuffer";
  errorPrefix?: string;
  /**
   * Which field carries the upstream message.
   *
   * "message" is the default. The ticket and hotel routes must stay on
   * "statusMessage": their pages read `err.statusMessage` directly
   * (BookingStep4Review.vue, hotels/reservation/[token].vue), so switching them
   * would silently blank out payment and promo-code error text.
   */
  errorShape?: "message" | "statusMessage";
  /**
   * Let the BUILD continue when this endpoint stays unavailable.
   *
   * Default is to abort: most of these calls supply content a visitor would
   * notice missing. Set this for data whose absence still leaves a correct page
   * — the per-page OG overrides, for instance, fall back to a generated card.
   * Killing a whole build over a social preview image is the wrong trade.
   */
  optionalAtBuild?: boolean;
}

/**
 * One request to PM One, with the parts every route needs: the API key, an
 * abort timeout, and an error shape pages can read.
 *
 * WHY IT IS CENTRAL: this block used to be copy-pasted into 20 route files,
 * each with its own drift — some had no timeout at all (a hung upstream then
 * burned Worker CPU until the platform killed it), some dropped `error.data` so
 * pages could not read 422 field errors, and 24 of them carried a
 * `|| "http://localhost:8000"` fallback that turned a missing production config
 * into requests against the worker's own loopback instead of a loud failure.
 *
 * `path` is everything after the origin, e.g. "/api/track/visit". Prefer the
 * two wrappers below; reach for this only for endpoints outside /api/public.
 *
 * How many times a build may re-ask before giving up.
 *
 * At RUNTIME: never. A visitor waiting on a page should get the fast failure and
 * the empty state; making them wait through three retries is worse than the
 * degraded render.
 *
 * At BUILD TIME: the opposite. A page rendered from a failed request is written
 * to disk and served for days, so a few seconds of backoff is cheap insurance.
 * megabuild shipped a home page with no dates, venue or edition on 8 Aug 2026
 * because ONE request lost a race with a loaded api.pmone.id — pages in that
 * build were taking 28 s against a 15 s timeout.
 *
 * Only worth retrying what can succeed on a second ask: network errors,
 * timeouts, 429 and 5xx. A 404 is a real answer (a project between editions has
 * no active event) and retrying it just slows the build down.
 */
const PRERENDER_ATTEMPTS = import.meta.prerender ? 4 : 1;
const RETRY_BASE_DELAY_MS = 1000;

const isRetryable = (status: number, timedOut: boolean): boolean =>
  timedOut || status === 429 || status >= 500 || status === 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function pmOneRequest<T = any>(
  path: string,
  opts: PmOneRequestOptions = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= PRERENDER_ATTEMPTS; attempt++) {
    try {
      return await pmOneRequestOnce<T>(path, opts);
    } catch (error: any) {
      lastError = error;

      const status = error?.statusCode ?? 0;
      const timedOut = status === 504;

      if (!isRetryable(status, timedOut)) {
        throw error; // 404 and friends are real answers, not outages
      }

      if (attempt === PRERENDER_ATTEMPTS) {
        // Retries exhausted against an API that IS supposed to answer. Throwing
        // is not enough: `useFetch` catches it, the page renders its empty
        // state, Nitro writes that to disk and the build goes green — which is
        // exactly how megabuild shipped a home page with no dates or venue
        // twice. Nothing downstream can distinguish that from a healthy render,
        // so the build has to die here.
        if (import.meta.prerender && !opts.optionalAtBuild) {
          console.error(
            `\n[pmOneFetch] FATAL: ${path} still failing (${status || "network"}) after ` +
              `${PRERENDER_ATTEMPTS} attempts.\n` +
              "Every page built from here would be baked without this data and served " +
              "until the next deploy. Aborting the build — retry when PM One is healthy.\n",
          );
          process.exit(1);
        }

        if (import.meta.prerender) {
          console.warn(
            `[pmOneFetch] ${path} unavailable after ${PRERENDER_ATTEMPTS} attempts, ` +
              "continuing without it (marked optional at build time).",
          );
        }
        throw error;
      }

      const delay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
      console.warn(
        `[pmOneFetch] ${path} failed (${status || "network"}), retrying in ${delay}ms ` +
          `(attempt ${attempt + 1}/${PRERENDER_ATTEMPTS})`,
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

async function pmOneRequestOnce<T = any>(
  path: string,
  opts: PmOneRequestOptions = {},
): Promise<T> {
  const config = useRuntimeConfig();

  const allowedKeys = opts.allowedQueryKeys;
  const filteredQuery = allowedKeys
    ? Object.fromEntries(
        Object.entries(opts.query ?? {}).filter(([k]) =>
          allowedKeys.includes(k),
        ),
      )
    : (opts.query ?? {});

  const controller = new AbortController();
  // Prerender waits longer than a visitor would: a slow answer still produces a
  // correct page, while an abort produces a permanently wrong one.
  const timeoutId = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? (import.meta.prerender ? 45000 : 15000),
  );

  try {
    return (await $fetch(`${config.public.apiUrl}${path}`, {
      method: opts.method ?? "GET",
      headers: {
        "X-API-Key": config.pmOneApiKey,
        Accept: "application/json",
        ...opts.headers,
      },
      query: filteredQuery,
      body: opts.body,
      responseType: opts.responseType as any,
      signal: controller.signal,
    })) as T;
  } catch (error: any) {
    const timedOut = error.name === "AbortError";

    const message = timedOut
      ? "Request timeout - API server took too long to respond"
      : error.data?.message ||
        error.message ||
        (opts.errorPrefix
          ? `${opts.errorPrefix} failed`
          : "Upstream fetch failed");

    throw createError({
      statusCode: timedOut ? 504 : error.response?.status || 500,
      ...(opts.errorShape === "statusMessage"
        ? { statusMessage: message }
        : { message }),
      // Passthrough the upstream body so pages can map 422 field errors, read a
      // form's closed_message on 403, etc.
      data: error.data,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Project-scoped endpoint: `/api/public/projects/{username}{path}`.
 *
 * The username is ALWAYS resolved from app config, never from client input —
 * that is what stops one event site from serving another project's content.
 */
export async function pmOneFetch<T = any>(
  path: string,
  opts: PmOneRequestOptions = {},
): Promise<T> {
  const appConfig = useAppConfig();
  const username =
    appConfig.app.dataSourceUsername || appConfig.app.projectUsername;

  return pmOneRequest<T>(`/api/public/projects/${username}${path}`, opts);
}

/** Public but not project-scoped: `/api/public{path}` (banners, hotels, tickets, blog). */
export async function pmOnePublicFetch<T = any>(
  path: string,
  opts: PmOneRequestOptions = {},
): Promise<T> {
  return pmOneRequest<T>(`/api/public${path}`, opts);
}
