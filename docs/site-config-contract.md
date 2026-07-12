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
