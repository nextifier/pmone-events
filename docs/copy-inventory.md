# Copy inventory (plan 012 spike, deliverable 1)

Machine-derived inventory of the `pages.*` / `components.*` keys consumed by
`layers/base` pages/components through `useContentStore()`, cross-referenced
against three sample apps' own overrides (megabuild, icc, cafeexpo) per the
plan. This quantifies the eventual rollout and is the input to the schema
decision in `docs/copy-migration-design.md`.

## Sources read

- `layers/base/app/composables/content.js` - the layer's own `content.js`.
  **Finding**: every one of the 16 apps provides its own
  `app/composables/content.js` (Nuxt layers replace, not merge, a
  same-path file), so this base-layer file is never actually imported by any
  app at runtime - it is a stale template (its copy is verbatim
  Megabuild-flavored English, hardcoded, pre-i18n). It is still useful here as
  the **widest historical key shape** apps were cloned from, but it is not the
  live source of truth for any site. Do not treat it as "the" schema; treat
  each app's own file as authoritative.
- `layers/base/app/composables/usePageMeta.js` - confirms `pages.*` is
  consumed exclusively as SEO `<title>`/description (fed into `useSeoMeta`),
  never rendered as visible body text. `OG_KEY_MAP` (`bookSpace -> book-space`,
  `ticket -> tickets`) maps two content-store `pages.*` keys to PM One's
  existing per-page OG override keys (`og_pages`) - evidence copy meta is
  the natural sibling of that already-shipped feature (plan 012's "why this
  matters").
- `apps/megabuild/app/composables/content.js`, `apps/icc/app/composables/content.js`,
  `apps/cafeexpo/app/composables/content.js` - the 3 sample apps' real,
  live overrides.
- `apps/{megabuild,icc,cafeexpo}/i18n/locales/en.ts` - confirms all three
  sample apps are in the **12 "setup-store + i18n `t()`"** cohort (not the 4
  hardcoded apps: campx, iicc, panorama-events, panorama-media). Their
  `content.js` is a `computed()` wrapper around `t("path.to.key")` calls, so
  the actual translated string per locale lives in the locale file, not in
  content.js itself.
- `layers/base/app/composables/contentContract.ts` (plan 015,
  `advisor/015-content-contract-and-campx-500` - not yet merged into this
  branch's `advisor/011` lineage; read via `git show` for reference only) -
  its `REQUIRED_CONTENT_KEYS` map lists which `pages.*`/`components.*` keys
  each base ROUTE dereferences, i.e. the subset that is SSR-render-critical
  (a missing key degrades a section instead of crashing, but still a content
  gap). Reused below to flag "critical" keys.

## content.js vs i18n locale files - two different things

`content.js` (Pinia store, `pages.*`/`components.*`) is **not** where
translated strings live for the 12 i18n-cohort apps - it is a thin
`computed()` shape that calls `t("key.path")`. The **flat** i18n key path
(e.g. `hero.title`, `pages.home.title`) does not always match the **nested**
store path (`components.hero.title`, `pages.home.title`) - `pages.*` happens
to line up 1:1, but every `components.*.X` key reads from the i18n file's
**top-level** `X.*` namespace, not a nested `components.X.*` namespace. A
migration `key` naming scheme should use the **store's** dot-path (as this
spike's `WebsiteCopy.keyFor()` does: `pages.home.title`) since that is the
shape `usePageMeta`/components actually consume - not the i18n file's flatter
layout, which is an app-specific i18n implementation detail unrelated to the
data's real shape once it's dashboard-managed (a dashboard row is not
locale-file-shaped, it is one translatable value with 5 locale slots).

The 4 hardcoded apps (campx, iicc, panorama-events, panorama-media) skip i18n
for content.js entirely - their `content.js` is a `defineStore("content", {
state: ... })` **options** store with literal English strings, no `t()`. A
copy migration for those 4 must write directly into the same dashboard
`website_copy` schema; the storage/delivery design is identical either way,
only the app-side extension point differs (setup-store vs. options-store).

## Table 1 - `pages.*` (type: **meta**, consumed by `usePageMeta(pageKey)` -> `useSeoMeta`)

The layer/megabuild baseline defines 17 page keys, each with `title` +
`description` (2 leaf strings/key). icc's cosplay/anime-convention domain
extends this with 9 event-specific pages icc alone needs; cafeexpo matches
the 17-key baseline exactly.

| Key | megabuild | icc | cafeexpo | Notes |
|---|---|---|---|---|
| `pages.home` | title, description | title, description | title, description | `withoutTitleTemplate: true` on all 3 (no " · siteName" suffix) - spike's Home page |
| `pages.brands` | title, description | title, description | title, description | spike's Brands page |
| `pages.rundown` | title, description | title, description | title, description | |
| `pages.programs` | title, description | title, description | title, description | |
| `pages.contact` | title, description | title, description | title, description | |
| `pages.bookSpace` | title, description | title, description | title, description | has an `og_pages` sibling key `book-space` (`OG_KEY_MAP`) |
| `pages.ticket` | title, description | title, description | title, description | has an `og_pages` sibling key `tickets` (`OG_KEY_MAP`) |
| `pages.gallery` | title, description | title, description | title, description | |
| `pages.faq` | title, description | title, description | title, description | |
| `pages.links` | title, description | title, description | title, description | |
| `pages.news` | title, description | title, description | title, description | |
| `pages.ticketPolicy` | title, description | title, description | title, description | |
| `pages.eventPolicy` | title, description | title, description | title, description | |
| `pages.partners` | title, description | title, description | title, description | |
| `pages.terms` | title, description | title, description | title, description | |
| `pages.privacy` | title, description | title, description | title, description | |
| `pages.winner` | title, description | title, description | title, description | |
| `pages.guests` | - | title, description | - | icc only |
| `pages.eventGuidelines` | - | title, description | - | icc only |
| `pages.safetyAndWeaponPolicy` | - | title, description | - | icc only |
| `pages.antiHarassmentPolicy` | - | title, description | - | icc only |
| `pages.meetAndGreet` | - | title, description | - | icc only |
| `pages.portfolioReview` | - | title, description | - | icc only |
| `pages.raya` | - | title, description | - | icc only |
| `pages.specialShow` | - | title, description | - | icc only |
| `pages.workshop` | - | title, description | - | icc only |

**Totals**: 17 shared keys x 2 fields = 34 meta strings/app baseline;
icc adds 9 x 2 = 18 more (52 total for icc). Across 5 locales that is
170-260 meta strings per app, x 16 apps - the bulk of the rollout's SEO-meta
surface. The original spike covered exactly 2 of these 17 shared keys
(`home`, `brands`), i.e. 4 leaf strings x 5 locales = 20 dashboard-writable
strings for megabuild. **Superseded by `advisor/012-complete`**: all 17
shared keys are now dashboard-writable for every project, not just megabuild
- see `docs/copy-migration-design.md` section 7 ("Post-spike fix and
generalization"). The 9 icc-only keys and `components.*` body copy (Table 2)
remain future rollout scope, unchanged.

## Table 2 - `components.*` (type: **body**, rendered directly in section components, never in `<head>`)

| Key | megabuild | icc | cafeexpo | Consumed by (component) |
|---|---|---|---|---|
| `components.hero` | title, description, countdownLabel, cta | title, description, countdownLabel, subHeadline, cta | title, description, countdownLabel, subHeadline, cta | Hero.vue - `REQUIRED_CONTENT_KEYS["index"]` (SSR-critical) |
| `components.trustedBy` | title | - | - | TrustedBy.vue - megabuild only |
| `components.brandPreview` | title | title | title | BrandPreview.vue |
| `components.about` | (empty `{}`) | (empty `{}`) | (empty `{}`) | About.vue - reserved, unused today |
| `components.brandList` | title, description | title, description | title, description | BrandList.vue - `REQUIRED_CONTENT_KEYS["brands"]` |
| `components.rundown` | title, description | title, description | title, description | Rundown.vue - `REQUIRED_CONTENT_KEYS["rundown"]` |
| `components.mainPrograms` | title, description | title, description | title, description | MainPrograms.vue - `REQUIRED_CONTENT_KEYS["programs"]` |
| `components.factsAndFigures` | subtitle, title, description | - | - | FactsAndFigures.vue - megabuild only |
| `components.partnerships` | title, description, `.exhibitor.{title,description,cta.label}`, `.partnerships[].{title,description,ctaLabel}` (2 items), `.reservedSpace.{title,cta.label}` | same shape | same shape | Partnerships.vue - deepest-nested key (3 levels) |
| `components.visitorCta` | title, description, cta.label | title, description, cta.label | title, description, cta.label | VisitorCta.vue |
| `components.mediaCoverage` | title, description | title, description | title, description | MediaCoverage.vue - `REQUIRED_CONTENT_KEYS["partners"]` |
| `components.credits` | title, description | title, description | title, description | Credits.vue - `REQUIRED_CONTENT_KEYS["partners"]` |
| `components.postSlider` | `title.default`, `title.morePosts` | same shape | same shape | PostSlider.vue |
| `components.contact` | title, description | title, description | title, description | Contact.vue - `REQUIRED_CONTENT_KEYS["contact"]` |
| `components.bookSpace` | title, description | title, description | title, description | BookSpace.vue - `REQUIRED_CONTENT_KEYS["book-space"]` |
| `components.faq` | title, description, emptyStateDescription, contactTitle | same shape | same shape | Faq.vue - `REQUIRED_CONTENT_KEYS["faq"]` |
| `components.eventGuidelines` | - | title, `list[0..4].{title,description}` | - | EventGuidelines.vue - icc only, 5-item list |

**Totals**: 16 shared-shape leaf groups on the megabuild baseline (2 of
which, `trustedBy` and `factsAndFigures`, are megabuild-exclusive); icc trades
those two for one 11-leaf `eventGuidelines` block; cafeexpo is the leanest of
the three (14 top-level keys, no `trustedBy`/`factsAndFigures`/`eventGuidelines`).
Body copy is **out of scope for the spike prototype** (deliverable 3 covers
SEO meta only) - this table exists to size the eventual rollout.

## Cross-reference: SSR-critical subset (plan 015's `REQUIRED_CONTENT_KEYS`)

Plan 015 (sibling in-flight branch, not yet in this branch's history) added a
dev-only console-warning contract mapping each base ROUTE to the
`pages.*`/`components.*` keys it dereferences, so a section degrades (hidden
or generic fallback) instead of crashing when an app's `content.js` omits a
key. The routes relevant to the spike's 2 pages:

- `index` (Home) requires `pages.home`, `components.hero`.
- `brands` requires `pages.brands`, `components.brandList`.

A rollout should keep this contract in sync as dashboard-copy keys are added -
noted as a maintenance item in `docs/copy-migration-design.md`.

## Implication for the schema decision

- SEO meta (`pages.*.title`/`.description`) is a small, **flat**, **uniform**
  set (2 leaf strings per page key) shared verbatim across every app that has
  that page - a clean, high-value first migration slice. This is what the
  spike prototypes.
- Body copy (`components.*`) is **deeply nested** (up to 3 levels,
  `partnerships.exhibitor.cta.label`) and **app-specific in shape**, not just
  content (icc's `eventGuidelines` has no megabuild equivalent at all). A
  flat `key` string (`components.partnerships.exhibitor.cta.label`) still
  works for storage (this spike's dot-path convention generalizes), but the
  **admin editor** for body copy needs per-app-aware forms, not a single
  fixed grid - explicitly flagged as rollout scope, not this spike's.
