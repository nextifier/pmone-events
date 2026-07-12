# Site config contract

Binding spec for the dashboard-managed `site_config` block delivered inside
the public website-settings payload (`data.settings.site_config`, PM One plan
007). Plans 008-012 (nav, analytics, appearance, identity, copy migrations)
must honor every rule below. A reviewer should check each of those plans
against this document before merge.

## Background

`site_config` is a stable, versioned container added to the existing
`GET /api/public/projects/{username}/website-settings` response by plan 007.
It ships **empty** (`version: 1`, `nav`/`analytics`/`appearance`/`identity`
all `null`) until a later plan starts writing real values. On the frontend,
`layers/base/app/composables/useSiteConfig.ts` is the reusable consumer:
getters that read the payload and return `null` on absence, mirroring
`useProjectSettings.js`.

## Rule 1: Zero-round-trip rule

All dashboard-managed site config is delivered inside the already-awaited
`useProjectSettingsData()` payload (key `project-settings`,
`/api/event/website-settings`). No migration plan may add a new client/SSR
fetch for config - doing so adds TTFB and violates the perf guardrail. Add new
sub-keys to the existing `site_config` block on the backend and read them
through `useSiteConfig()` on the frontend; never introduce a second endpoint
or a second `useFetch` call for config data.

## Rule 2: Fail-open rule

Every consumer must fall back to the baked `app.config` (or `content.js`)
value when the API value is `null`/absent, so first paint is never empty and
an API outage never blanks the site. Mirror `useProjectSettings.js`: read the
API value, and if it is `null`, use the existing hardcoded default - never
throw, never render an empty state because the fetch failed or the project
has not configured that key yet.

## Rule 3: SSR-in-`<head>`/HTML rule

Nav links and meta/copy must be rendered into the **server** HTML (they
already are, because the payload is awaited server-side by the
`projectSettings` plugin before any page setup runs). No config may become
client-only - that would cause CLS (nav filling in late) and weaken
crawlability. Cross-reference plan 019 (Core Web Vitals) and plan 020 (SEO).

## Rule 4: No-layout-shift rule

When a value can change length or presence (nav item count, hero copy),
reserve space / keep the baked fallback as the SSR value so the runtime value
does not reflow after hydration. A dashboard edit that changes, e.g., the
number of nav items must not cause a visible shift on the already-rendered
page for users who loaded before the edit propagated.

## Rule 5: List-merge caveat

`updateWebsiteSettings` (`ProjectController.php`) merges the incoming payload
into stored settings via `array_replace_recursive`, which merges list-type
(numerically indexed) arrays **by index**, not wholesale. Any list-shaped
config (e.g. `nav` arrays introduced by plan 008) must be saved with a
wholesale-replace special-case, exactly like the existing
`hotels.notification_email` special-case
(`ProjectController.php:436-438`) - otherwise removing the last item in a list
can resurrect a stale entry from a previous save instead of disappearing.

## Rule 6: Cache-invalidation rule

Writing through `updateWebsiteSettings` already busts
`website-settings:{username}` via `Project::settingsResponseCacheTags()`
(confirmed in plan 007, Step 1: `SETTINGS_RESPONSE_CACHE_TAGS` includes
`'website-settings'`). Any new write path for `site_config` sub-keys must call
`ResponseCache::clear($project->settingsResponseCacheTags())` the same way, so
the public payload never serves a stale `site_config` for the remainder of
its 24h TTL. Cross-reference plan 013 (cache-invalidation hardening).

## Perf regression gates (plan 029)

Plan 029 (Core Web Vitals) is the measure-first companion to this contract: it
established that the current baseline (image provider, font preload, OG
caching - see plan 029 "Current state") is good and must not regress as
008-012 move nav/analytics/appearance/identity/copy from baked config to the
runtime `site_config` payload. These are the gates every one of those plans
must pass before merge. A reviewer should run this checklist against the diff,
not just read it.

1. **SSR-rendered, never client-only.** View-source (or `curl` the page,
   not `curl` the API) the migrated surface and confirm the nav links / copy /
   appearance values are present in the raw server HTML. If a value only
   appears after hydration, the migration violates Rule 3 - reject it.
2. **No new network request.** Open the network panel (or grep the diff for a
   new `useFetch`/`$fetch` call) and confirm config rides the existing
   `useProjectSettingsData()` payload (Rule 1). A second round-trip for config
   is an automatic reject regardless of how small it looks.
3. **CLS ≈ 0 on the header/nav.** Load the page, let it fully hydrate, and
   confirm no visible reflow of the header/nav/hero once the runtime value
   resolves (Lighthouse CLS score on the migrated route, or manually toggle
   the dashboard value and reload to see whether previously-cached HTML pops).
   Concretely: **do not ship a nav/section toggle that follows the
   `useHomeSection` "default-off" pattern**
   (`layers/base/app/composables/useHomeSection.ts`) - that mode uses
   `server: false, lazy: true`, so the section renders nothing during SSR and
   only appears after a client-side fetch resolves post-hydration. It avoids a
   hydration *mismatch* but not a post-load layout *shift*, and it is the
   opposite of what Rule 3/Rule 4 require for nav/copy. If a migrated section
   needs a hide/show toggle, use the "default-on, fail-open" mode
   (`useProjectSettingsData()`, SSR-resolved) the same composable already
   supports, or reserve space for the off state.
4. **Analytics is client-only and deferred.** Confirm the analytics
   init call still lives solely in
   `layers/base/app/plugins/analytics.client.ts` (manual `initMode`,
   `loadingStrategy: "defer"` in `layers/base/nuxt.config.ts:205-215`) and
   that no migrated code path moves `gtag.js` init earlier or duplicates it -
   double-init or an earlier init both cost main-thread time at first paint.
5. **PageSpeed within the Step 1 baseline.** Run PageSpeed Insights /
   Lighthouse (mobile + desktop) against the migrated route and diff LCP,
   CLS, INP, TBT, FCP, TTFB against the plan 029 Step 1 baseline table for
   that app. No metric may regress. **As of this writing the Step 1 baseline
   has not been captured** (no production/browser access in this session) -
   until it exists, this gate can only be checked structurally (gates 1-4);
   treat any migration merged before the baseline exists as provisionally
   gated and re-verify once real numbers land.

### Known pre-existing patterns to not copy into the migration

These are not caused by 008-012 and are out of scope to fix under plan 029
(no measured baseline to justify the trade-off), but they are exactly the
shape of bug the gates above exist to catch, so migrated code must not
reproduce them:

- **Text hidden until client JS (`SplitText3D`,
  `layers/base/app/components/SplitText3D.vue`).** The component sets
  `visibility: hidden` on its root until `onMounted` -> `document.fonts.ready`
  -> GSAP `SplitText` all resolve client-side. Two hero H1s
  (`apps/iicc/app/components/Hero.vue`, `apps/outingexpo/app/components/Hero.vue`)
  wrap their headline in it, which removes the headline as a candidate LCP
  element on first paint and hands LCP to whatever is visible instead (in both
  cases, the hero image - now `fetchpriority="high"` + `preload`ed as of this
  plan). Do not gate migrated copy behind a component with this pattern.
- **`useHomeSection` "default-off" mode** - see gate 3 above.
