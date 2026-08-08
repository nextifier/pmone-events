/**
 * 301s for /news slugs Google still holds but the CMS no longer serves.
 *
 * WHY THIS EXISTS: deleting a post in PM One soft-deletes the row, and the
 * `unique:posts,slug` rule counts soft-deleted rows — so the rewritten article
 * that replaces it cannot reuse the old slug and gets `-1`/`-2` appended
 * instead. The old URL then 404s with nothing pointing at its replacement.
 * Audited 8 Aug 2026: nine articles across five sites were in that state, all
 * of them previously indexed. `/news/kitchen-crew-adalah` and
 * `/news/frozen-food-apa-saja` were still being crawled by Google weeks later.
 *
 * WHY A HELPER RATHER THAN LITERAL ENTRIES: nuxt-i18n runs
 * `prefix_except_default`, so every redirect needs one rule per locale. Nine
 * redirects written out by hand is forty-five near-identical lines spread over
 * six configs, and the locale variants are exactly what a hurried edit forgets.
 *
 * This is a stopgap, not a redirect system. If the list grows much past this,
 * the fix is to stop generating `-1` slugs — either by excluding soft-deleted
 * rows from the uniqueness check, or by recording the rename in the database
 * and serving redirects from there.
 */

/** Empty string is the default locale, which carries no prefix. */
const DEFAULT_LOCALE_PREFIXES = ["", "/id", "/zh", "/ja", "/ko"] as const;

type RedirectRule = { redirect: { to: string; statusCode: 301 } };

/**
 * @param pairs  old slug -> current slug, both without the `/news/` prefix
 * @param prefixes  locale prefixes this site actually serves
 */
export function newsRedirects(
  pairs: Record<string, string>,
  prefixes: readonly string[] = DEFAULT_LOCALE_PREFIXES,
): Record<string, RedirectRule> {
  const rules: Record<string, RedirectRule> = {};

  for (const [from, to] of Object.entries(pairs)) {
    for (const prefix of prefixes) {
      rules[`${prefix}/news/${from}`] = {
        redirect: { to: `${prefix}/news/${to}`, statusCode: 301 },
      };
    }
  }

  return rules;
}

/** For sites that serve English only. */
export const ENGLISH_ONLY = [""] as const;
