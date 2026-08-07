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
 * to disk and served for days, so ~45s of backoff is cheap insurance. It needs
 * to be that long because a push rebuilds all 16 sites at once and api.pmone.id
 * drops out under that herd — a 7-second budget was not enough to ride out the
 * peak, and megabuild (the largest build) kept losing.
 * megabuild shipped a home page with no dates, venue or edition on 8 Aug 2026
 * because ONE request lost a race with a loaded api.pmone.id — pages in that
 * build were taking 28 s against a 15 s timeout.
 *
 * Only worth retrying what can succeed on a second ask: network errors,
 * timeouts, 429 and 5xx. A 404 is a real answer (a project between editions has
 * no active event) and retrying it just slows the build down.
 */
const PRERENDER_ATTEMPTS = import.meta.prerender ? 7 : 1;
const RETRY_BASE_DELAY_MS = 1000;
/** 1+2+4+8+15+15 = 45s of patience. */
const RETRY_MAX_DELAY_MS = 15000;

const isRetryable = (status: number, timedOut: boolean): boolean =>
  timedOut || status === 429 || status >= 500 || status === 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Paths whose retry ladder already ran out during THIS build.
 *
 * Nitro's `defineCachedEventHandler` caches successes but never failures
 * (nitropack/dist/runtime/internal/cache.mjs — `setItem` sits in the success
 * branch only). So with `concurrency: 4`, every wave of prerendered routes
 * re-runs the whole ladder from scratch against an upstream that has already
 * proven it cannot answer. On 8 Aug 2026 that turned one unreachable API into
 * hundreds of requests from a single build.
 *
 * Once a path is in here the build is already doomed — the fatal path below
 * exits — but optional endpoints keep running, and they must not re-queue.
 */
const exhausted = new Set<string>();

/**
 * Everything the next person needs to tell "the origin is down" apart from
 * "something between us and the origin is down", which cost a whole night of
 * guessing on 8 Aug 2026. `cf-ray` names the Cloudflare data centre, and the
 * body of a Cloudflare-generated error says which error it is; an origin
 * response has neither.
 */
function upstreamForensics(error: any): string {
  const headers = error?.data?.__headers as Record<string, string> | undefined;
  const parts = [
    headers?.["cf-ray"] && `cf-ray=${headers["cf-ray"]}`,
    headers?.["cf-cache-status"] && `cf-cache=${headers["cf-cache-status"]}`,
    headers?.server && `server=${headers.server}`,
  ].filter(Boolean);

  return parts.length ? ` [${parts.join(" ")}]` : "";
}

function headerSnapshot(response: unknown): Record<string, string> {
  const headers = (response as { headers?: Headers } | undefined)?.headers;

  if (!headers?.get) {
    return {};
  }

  const wanted = ["cf-ray", "cf-cache-status", "server"];
  const snapshot: Record<string, string> = {};

  for (const name of wanted) {
    const value = headers.get(name);
    if (value) {
      snapshot[name] = value;
    }
  }

  return snapshot;
}

export async function pmOneRequest<T = any>(
  path: string,
  opts: PmOneRequestOptions = {},
): Promise<T> {
  let lastError: unknown;

  if (import.meta.prerender && exhausted.has(path)) {
    throw createError({
      statusCode: 503,
      message: `[pmOneFetch] ${path} already exhausted its retries earlier in this build`,
    });
  }

  // An endpoint the build can finish without does not get to spend the build's
  // patience. /website-settings (OG overrides only) burned 2m44s of retries on
  // 8 Aug 2026 before /events/active — the one that actually matters — had made
  // its first request, on a build that then died with time still on the clock.
  const attempts = opts.optionalAtBuild
    ? Math.min(2, PRERENDER_ATTEMPTS)
    : PRERENDER_ATTEMPTS;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      // The last attempt of a BUILD goes out under a URL nothing can have
      // cached. If the failure lives in an intermediary rather than the origin,
      // this is the one request that routes around it — and if it fails too,
      // the origin really is unreachable and the log says so unambiguously.
      //
      // Never at runtime: there `attempts` is 1, so every visitor request would
      // carry a unique key and miss the origin's response cache outright.
      return await pmOneRequestOnce<T>(
        path,
        opts,
        import.meta.prerender && attempt === attempts,
      );
    } catch (error: any) {
      lastError = error;

      const status = error?.statusCode ?? 0;
      const timedOut = status === 504;

      if (!isRetryable(status, timedOut)) {
        throw error; // 404 and friends are real answers, not outages
      }

      if (attempt === attempts) {
        exhausted.add(path);

        // Retries exhausted against an API that IS supposed to answer. Throwing
        // is not enough: `useFetch` catches it, the page renders its empty
        // state, Nitro writes that to disk and the build goes green — which is
        // exactly how megabuild shipped a home page with no dates or venue
        // twice. Nothing downstream can distinguish that from a healthy render,
        // so the build has to die here.
        if (import.meta.prerender && !opts.optionalAtBuild) {
          console.error(
            `\n[pmOneFetch] FATAL: ${path} still failing (${status || "network"}) after ` +
              `${attempts} attempts${upstreamForensics(error)}.\n` +
              `Upstream said: ${String(error?.message ?? "").slice(0, 300)}\n` +
              "Every page built from here would be baked without this data and served " +
              "until the next deploy. Aborting the build — retry when PM One is healthy.\n",
          );
          process.exit(1);
        }

        if (import.meta.prerender) {
          console.warn(
            `[pmOneFetch] ${path} unavailable after ${attempts} attempts, ` +
              "continuing without it (marked optional at build time).",
          );
        }
        throw error;
      }

      const delay = Math.min(
        RETRY_BASE_DELAY_MS * 2 ** (attempt - 1),
        RETRY_MAX_DELAY_MS,
      );
      console.warn(
        `[pmOneFetch] ${path} failed (${status || "network"})${upstreamForensics(error)}, ` +
          `retrying in ${delay}ms (attempt ${attempt + 1}/${attempts})`,
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

async function pmOneRequestOnce<T = any>(
  path: string,
  opts: PmOneRequestOptions = {},
  bypassCaches = false,
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

  // A key nothing upstream has seen, so no edge or response cache can answer
  // it. Only ever set on the final attempt: it costs the origin a full render,
  // which is the right price once, and the wrong price on every request.
  const query = bypassCaches
    ? { ...filteredQuery, _retry: Date.now().toString(36) }
    : filteredQuery;

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
      query,
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
      // form's closed_message on 403, etc. During a build the response headers
      // ride along too: they are the only way to see whether a 5xx came from
      // the origin or from Cloudflare in front of it.
      data: import.meta.prerender
        ? { ...(error.data ?? {}), __headers: headerSnapshot(error.response) }
        : error.data,
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
