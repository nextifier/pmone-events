/**
 * Keep `i18n_locale` in sync with the locale the visitor is actually reading.
 *
 * WHY THIS EXISTS: `detectBrowserLanguage` normally sets this cookie on the SSR
 * response, but server/plugins/cacheControl.ts strips `set-cookie` from every
 * cacheable HTML response — Cloudflare's CDN will not store a response that
 * carries one, and without that strip no HTML is edge-cached at all.
 *
 * The cookie's only reader is bare "/", which is where `redirectOn: "root"`
 * negotiates a locale. So a visitor who arrives from Google on /id/news/x used
 * to leave with no cookie, and their next visit to "/" re-negotiated from
 * Accept-Language — sending an Indonesian reader to the English homepage if
 * their browser happened to be installed in English. Writing the cookie here
 * restores that stickiness and costs the cache nothing: a cookie set by the
 * browser is invisible to the CDN.
 *
 * Everything runs inside `app:mounted`, client-side:
 *   - `useI18n()` cannot be used here at all — it needs a component setup
 *     context, and calling it in a plugin throws "Must be called at the top of
 *     a `setup` function", which surfaces as NUXT_E1005 and a blank error page.
 *     `nuxtApp.$i18n.locale` is the same ref without that requirement.
 *   - Waiting for `app:mounted` guarantees @nuxtjs/i18n has installed `$i18n`
 *     and keeps this strictly out of the SSR render, so the response can never
 *     vary by cookie again.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const ONE_YEAR = 60 * 60 * 24 * 365;

  const write = (value: unknown) => {
    if (typeof value !== "string" || !value) {
      return;
    }
    document.cookie = `i18n_locale=${value}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  };

  nuxtApp.hook("app:mounted", () => {
    const locale = (nuxtApp.$i18n as { locale?: Ref<string> } | undefined)
      ?.locale;

    if (!locale) {
      return;
    }

    write(locale.value);
    watch(locale, write);
  });
});
