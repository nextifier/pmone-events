/**
 * Reusable consumer for the dashboard-managed `site_config` block inside the
 * public website-settings payload (`data.settings.site_config`, PM One plan
 * 007). Mirrors `useProjectSettings.js`: getters that read the SSR-resolved
 * payload and return `null` when the API has no value, never throwing.
 *
 * Reads the **same** `useProjectSettingsData()` entry (key `project-settings`)
 * already awaited by the `projectSettings` plugin, so calling this adds zero
 * new fetches - see `docs/site-config-contract.md`, rule 1 (zero-round-trip).
 *
 * Every sub-key is `null` until the plan that introduces it (008 nav, 009
 * analytics, 010 appearance, 011 identity) starts writing real values. Callers
 * supply their own `app.config` / `content.js` fallback when a value is
 * `null` - this composable does not bake in defaults, per the fail-open rule
 * (rule 2) in the contract doc.
 *
 * NAMED `useProjectSiteConfig` (not `useSiteConfig`) ON PURPOSE: `@nuxtjs/seo`
 * (nuxt-site-config) auto-imports its own global `useSiteConfig()` returning
 * the SEO site config (`{ name, url, env, … }`, no site_config sub-keys). That
 * name collides and shadows this one in Nuxt's auto-import, so every
 * `useSiteConfig().appearance/nav/analytics/identity` read resolved to the SEO
 * object and came back `undefined` - the dashboard palette/identity/analytics
 * silently never applied. A distinct name keeps this consumer unambiguous.
 */

interface SiteConfig {
  version: number;
  nav: unknown | null;
  analytics: unknown | null;
  appearance: unknown | null;
  identity: unknown | null;
}

export function useProjectSiteConfig() {
  // Read the shared payload at ACCESS time via useNuxtData, not a ref captured
  // once at setup. The projectSettings plugin awaits useProjectSettingsData()
  // during SSR, populating the `project-settings` asyncData; reading it back
  // through useNuxtData here returns that resolved entry in every component
  // context. Destructuring `useProjectSettingsData().data` at setup instead
  // captured a ref stuck on its `default: null` in component setups (plugin-
  // first fetch + re-registration), so nav/analytics/appearance/identity
  // silently fell back to baked app.config values even though the SSR payload
  // held the real data.
  const siteConfig = (): SiteConfig | null => {
    const { data } = useNuxtData("project-settings");

    return (data.value as { data?: { settings?: { site_config?: SiteConfig } } })
      ?.data?.settings?.site_config ?? null;
  };

  return reactive({
    get _raw() {
      return siteConfig();
    },
    get version() {
      return siteConfig()?.version ?? 1;
    },
    get nav() {
      return siteConfig()?.nav ?? null;
    },
    get analytics() {
      return siteConfig()?.analytics ?? null;
    },
    get appearance() {
      return siteConfig()?.appearance ?? null;
    },
    get identity() {
      return siteConfig()?.identity ?? null;
    },
  });
}
