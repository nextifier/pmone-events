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
 */

interface SiteConfig {
  version: number;
  nav: unknown | null;
  analytics: unknown | null;
  appearance: unknown | null;
  identity: unknown | null;
}

export function useSiteConfig() {
  const { data } = useProjectSettingsData();

  const siteConfig = (): SiteConfig | null =>
    (data.value as { data?: { settings?: { site_config?: SiteConfig } } })
      ?.data?.settings?.site_config ?? null;

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
