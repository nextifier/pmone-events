# Copy + SEO meta migration - design (plan 012 spike, deliverable 2)

Design doc for moving page/section copy and SEO meta from the baked
`content.js`/i18n stores into a dashboard-managed, translatable store. Scope:
decide the schema and delivery shape, and record the spike prototype's
verification results (deliverable 4). See `docs/copy-inventory.md` for the
key inventory this design is sized against, and
`docs/site-config-contract.md` for the binding rules (rule numbers cited
below) every `site_config` sub-key must honor.

## 1. Storage: new `website_copy` table (not an extension of `WebsitePage`)

**Decision**: a new PM One table `website_copy` - `id`, `project_id`, `key`
(flat dot-path string, e.g. `pages.home.title`), translatable `value` (JSON,
Spatie `HasTranslations`), timestamps, unique `(project_id, key)`. Model
`App\Models\WebsiteCopy`. This is the pattern plan 011's `WebsitePage`
established (`project_id` + `key` + one `Spatie\Translatable` column +
`ClearsResponseCache`), reused verbatim rather than invented fresh.

**Why a new table, not widening `WebsitePage`**:

- `WebsitePage::KEYS` is a closed whitelist of exactly the six legal/policy
  pages, and its single translatable field is named `body` (rich HTML,
  `max:50000`, edited via `TipTapEditor`). Copy is a different shape: many
  small **flat leaf strings** (`title`, `description`, and eventually nested
  body-copy leaves like `partnerships.exhibitor.cta.label` - see the
  inventory's Table 2), short (`max:300` for meta), edited via plain text
  inputs. Reusing `body` for both would mean either overloading one column's
  semantics (a legal page's `body` and a page's `title` are not the same kind
  of value) or storing copy as one giant per-page JSON blob under `body`,
  which throws away the field-level granularity `usePageMeta` needs (it reads
  exactly `title` or exactly `description`, not "the page's copy blob").
- `WebsitePage.key` names a *page* (`terms`, `privacy`, ...); `WebsiteCopy.key`
  names a *leaf value* (`pages.home.title`) using the content-store's own
  dot-path convention (see inventory: this is intentionally the **store's**
  path, not the i18n locale file's flatter layout, because the store's shape
  is what `usePageMeta`/section components actually consume). Widening
  `WebsitePage::KEYS` to include leaf paths like `pages.home.title` would
  conflate two different granularities (whole-page vs. single-field) under
  one model, complicating both the admin index endpoint's response shape and
  the six-key legal-page invariant several other places rely on
  (`WebsitePage::KEYS` is asserted verbatim in three existing tests).
- The two tables can and do share every architectural pattern
  (`ClearsResponseCache`, `HasTranslations`, `firstOrNew` upsert-by-key,
  fail-open-to-null resolution) without sharing a table. A rollout that later
  wants a generic `{key -> translatable value}` store for *all* dashboard
  text (nav labels, buttons, anything) would still keep `website_copy`
  separate from `website_pages`, since legal-page bodies remain a distinct,
  larger, TipTap-edited kind of content.

**Spike-scoped whitelist**: `WebsiteCopy::PAGE_KEYS = ['home', 'brands']`,
`WebsiteCopy::FIELDS = ['title', 'description']`. A rollout widens both
constants (and the admin editor's page/field grid) - the storage shape does
not change.

## 2. Delivery: SEO meta rides `website-settings`; body copy would use a separate endpoint

**Decision**: `site_config.copy` is added as a new sub-key of the existing
`site_config` block inside `GET /api/public/projects/{username}/website-settings`
(PM One `PublicProjectController::websiteSettings`), which pmone-events
already fetches once via `useProjectSettingsData()` and awaits server-side in
the `projectSettings` plugin before any page `setup()` runs - see
`docs/site-config-contract.md` rule 1 (zero-round-trip) and rule 3
(SSR-in-`<head>`). No new endpoint, no new fetch call site.

This mirrors the existing `og_pages` sibling feature exactly (per-page,
served inside the same payload) rather than `website-pages` (plan 011's
legal-page bodies, a **separate** cached endpoint,
`GET /api/public/projects/{username}/website-pages`, fetched via its own
`useWebsitePage.ts` composable / `/api/event/website-pages` Nitro proxy).
That split is intentional and should hold for the rollout too:

| | SEO meta (`site_config.copy`) | Body copy (future rollout) |
|---|---|---|
| Size | 2 short strings/page (title, description) | Many leaf strings, some pages | 
| Needed in `<head>` on first paint | Yes, always | No - rendered mid-page |
| Needed on every page | Yes (every page calls `usePageMeta`) | No - only the page that owns that section |
| Delivery | Inside `website-settings` (already awaited) | Separate cached endpoint, like `website-pages` |

Rationale: `website-settings` is fetched on **every** page render (the
`projectSettings` plugin awaits it unconditionally), so anything added to it
is paid for by every page whether or not that page needs it. SEO meta
qualifies (every page needs *some* meta). Body copy for, say, the Partners
page's `credits` section should not inflate the payload every Home/Rundown/
Contact page render pays for - it belongs behind a page-scoped, separately
cached fetch, exactly like `website-pages`.

**Locale-awareness gap found and fixed during the spike**: `website-settings`
was previously **not** locale-parameterized (`getKey: () => "default"` in the
Nitro proxy, no `?locale=` forwarded) because none of its existing sub-keys
(nav/analytics/appearance/identity/og_pages/home sections) are
locale-dependent - a single cached response served every language correctly.
`site_config.copy` is the first locale-dependent sub-key, so the spike:

- Added `Request $request` + a `?locale=` param to
  `PublicProjectController::websiteSettings()` (mirrors `websitePages()`),
  read once and passed only into the new `websiteCopyPayload()` helper -
  every other sub-key's resolution is untouched and remains locale-agnostic.
- Changed the Nitro proxy (`server/api/event/website-settings.get.ts`) to
  forward `?locale=` and vary its cache key per locale
  (`getKey: (event) => \`l:${locale}\``), mirroring `website-pages.get.ts`.
- Changed `useProjectSettingsData()` to call `useI18n()`, pass
  `query: { locale }`, key the `useFetch` call per locale
  (`project-settings-${locale.value}`), and added `watch: [locale]` so a
  **client-side** locale switch (same route, reused component instance under
  `prefix_except_default` routing - the target page's `setup()` does not
  re-run, so a plain reactive `key` alone is not enough) still refetches.
  This mirrors `useWebsitePage.ts`'s identical `watch: [locale]` for the same
  reason, one file over.

This is a **wider blast radius than the two prototyped pages**: every
consumer of `useProjectSettingsData()` (`useSiteConfig`, `useProjectSettings`,
`useHomeSection`, `usePageMeta`'s `apiOg`) now shares a **per-locale**-keyed
fetch/cache instead of one global one. Functionally harmless for those
locale-agnostic consumers (identical data at every locale, just cached under
~5 separate keys instead of 1), but it is a real, if small, cache-fragmentation
and Nitro-cache-storage cost worth calling out - see the TTFB note below.

## 3. Fallback: dashboard value > baked value, per field

Exactly `usePageMeta`'s existing `apiOg` precedent (an OG title/description
from PM One already wins over the content-store value), extended one level:

```
title = override (explicit per-call, e.g. a blog post's own title)
     || dashboardCopy.title (site_config.copy.pages[pageKey].title)
     || meta.title (baked content.js/i18n value)
     || ""
```

`overrides.title` keeps top priority over dashboard copy deliberately: it
represents a *specific entity's* identity (a blog post's own title, a brand's
own name passed into `usePageMeta(null, { title })`), not generic page-level
copy - a dashboard edit to the **Brands page's** meta must never shadow an
individual **brand detail page's** own title.

Backend fail-open mirrors `WebsitePage`/`websitePages()` exactly: a project
with no `WebsiteCopy` row for a key, or a row with no saved translation for
the requested locale, resolves to `null` (`filled($value) ? $value : null`),
never an empty string - so the frontend's `||` chain always falls through
correctly (an empty string is falsy in JS, `null` is falsy too, both fall
through the same way).

## 4. Locale mapping

5 locales throughout, matching `WebsitePage`/the FormRequest/the frontend
`LOCALES` constant already established by plan 011: `en`, `id`, `ja`, `ko`,
`zh`. `WebsiteCopy::value` is a Spatie-translatable JSON column with the same
5 keys. The public endpoint resolves `getTranslation('value', $locale, false)`
(strict - `false` disables Spatie's own fallback-locale chain, so a missing
translation returns `null`, not silently the app's configured fallback
locale's value) exactly like `websitePages()` does for `body`.

## 5. Rollout order (informed by the inventory)

1. **This spike**: `pages.home` + `pages.brands` meta, megabuild only.
2. SEO meta for the remaining 15 shared `pages.*` keys (Table 1 in the
   inventory), still meta-only, still riding `website-settings` - no new
   architecture needed, just widening `WebsiteCopy::PAGE_KEYS` and the admin
   grid.
3. Per-app-specific `pages.*` keys (icc's 9 extra keys) - same mechanism,
   confirms the design generalizes past the two "every app has this" pages.
4. Body copy (`components.*`, Table 2) via the **separate cached endpoint**
   pattern (section 2) - starts with the SSR-critical subset
   (`REQUIRED_CONTENT_KEYS`: `components.hero`, `components.brandList`, etc.)
   since those already have a documented dev-time contract to stay in sync
   with.
5. Each step stays behind the fallback (baked `content.js`/i18n never
   deleted) so a half-migrated app/page never breaks - per the plan's
   maintenance note. Do not delete baked copy until every project has saved
   its own copy for a key and the fallback is proven redundant.

## 6. Verification + measurement (deliverable 4)

### SSR-rendered, code-level reasoning (BROWSER-UNVERIFIED - no browser available in this environment)

- `usePageMeta.js` computes `dashboardCopy` synchronously from
  `projectSettings.value` (a plain `.value` read, no `await`, no client-only
  guard) and feeds `title`/`description` into `useSeoMeta(...)` in the same
  synchronous function body - identical control flow to the pre-existing
  `apiOg`/`ogTitle`/`ogDescription` precedent that already ships to
  production. `useSeoMeta` writes into Nuxt's head manager, which
  `nuxt-og-image`/Nuxt's core `useHead` renders into the SSR response HTML.
  Because `projectSettings` is `await`ed by the `projectSettings` plugin
  (`dependsOn` chain, `import.meta.server` guard) **before** any page
  `setup()` runs, `projectSettings.value` is already resolved (not a pending
  promise) by the time `usePageMeta` reads it during a page's own `setup()` -
  so the value is available for the *first* server-rendered response, not
  filled in after hydration.
- Open risk, explicitly flagged: this reasoning assumes `useI18n()` (now
  called inside `useProjectSettingsData()`, itself called inside the
  `projectSettings` plugin's `setup()`) resolves the request's real locale by
  the time the plugin runs. `@nuxtjs/i18n`'s own plugin is registered via
  Nuxt's module system, which runs before the `app/plugins/` directory scan,
  so it should already have parsed the incoming URL/prefix and set `locale`
  correctly - but this specific ordering (a **plugin** calling `useI18n()`,
  as opposed to the existing precedent of composables/pages calling it) has
  no prior example in this codebase and **must** be confirmed with a live
  `pnpm dev:megabuild` + view-source check (`<title>` in `/id/` vs `/`
  matches the locale) before rollout. This is the single highest-risk item
  from this spike.

### Fail-open on API outage, code-level reasoning (BROWSER-UNVERIFIED - no dead-port test run)

- `useProjectSettingsData()` sets `default: () => null` on `useFetch`; this
  behavior is unchanged by the spike (only `query`/`key`/`watch` were added).
  The existing `projectSettings.ts` plugin docblock already documents and
  relies on exactly this: "on API failure the payload stays null and every
  page falls back to the Takumi card" - i.e. this fail-open path is
  pre-existing, trusted behavior this spike extends rather than introduces.
- With `projectSettings.value === null` (API down / dead port), `usePageMeta`'s
  `dashboardCopy` computation is
  `projectSettings.value?.data?.settings?.site_config?.copy?.pages?.[pageKey]
  ?? null` - optional-chained through a `null` root, so it resolves to `null`
  without throwing. `title`/`description` then fall through
  `|| dashboardCopy?.title` (also `undefined` on a `null` `dashboardCopy`) to
  `|| meta.value?.title` - the baked `content.js`/i18n value, which is always
  present (it is a synchronous Pinia getter, not a fetch). Never empty.
  **Still recommend a live dead-port test** (point `PM_ONE_API_KEY`/API URL at
  a closed port, `view-source:` on `/` and `/brands`, confirm `<title>` is
  the baked English string) before rollout sign-off - not run here.

### No new fetch added (verified by inspection, not a runtime trace)

- Confirmed by reading every call site touched: `usePageMeta.js` now calls
  `useProjectSettingsData()` **once** (the pre-existing `apiOg` block's own
  call was removed and both now share the single call at the top of the
  function) - so the diff **reduces** the number of `useProjectSettingsData()`
  call sites inside `usePageMeta` from implicit-duplicate-but-deduped to
  explicit-single, and adds zero new endpoints/routes. The only two files
  that changed their HTTP behavior are the existing `website-settings`
  Nitro route (now forwards one extra query param on the SAME request) and
  the existing PM One `websiteSettings()` controller method (now reads one
  extra query param on the SAME route) - no new route was added on either
  side.

### TTFB delta

- Expected **~0**: no new request was added to the critical path: the same
  single already-awaited `website-settings` fetch now carries a few more JSON
  bytes (4 short strings for the spike's 2 keys) and one more query-string
  parameter. The response-size delta (well under 1KB for the spike's scope)
  is far below the threshold where it would measurably affect TTFB.
- Secondary cost, not TTFB but worth recording: `website-settings`'s Nitro
  SWR cache is now fragmented by locale (up to ~5x the cache entries for that
  one route). Since it was already a 60s-`maxAge` SWR cache serving cheap,
  small JSON, this is a negligible memory/storage cost, not a latency one -
  noted for completeness, not a blocker.

### Not run (explicitly out of reach in this environment)

- `pnpm dev:megabuild` + `view-source:` on `/` and `/brands` to visually
  confirm `<title>`/`<meta name="description">` in the raw server HTML.
- The dead-port fail-open test.
- Any Playwright/browser automation (no browser tool was available in this
  execution).

All three are recommended, concrete pre-rollout checks - the plan's STOP
conditions require them to pass before a broader migration proceeds.
