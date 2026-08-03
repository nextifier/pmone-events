import { appearanceCss, DEFAULT_APPEARANCE, normalizeAppearance } from "@/lib/appearance";

type AppearanceOverride = Partial<typeof DEFAULT_APPEARANCE> & { enabled?: boolean };

/**
 * OPT-IN per-project design tokens — injects the baseColor/theme/chartColor/
 * radius CSS vars as `<style id="appearance-vars">` ONLY when the merged config
 * resolves `enabled: true`. Disabled (default) emits an idempotent no-op
 * `:root:root{}` so each app keeps its native palette from app.css
 * (`:root`/`.dark` token overrides) — production look. Token-only,
 * components/ui untouched.
 *
 * Three ways to theme a project, in increasing precedence:
 *  1) Custom brand palette (recommended for branded sites like iicc/megabuild):
 *     edit that app's `app/assets/css/app.css` — override `--color-gray-*` and
 *     semantic tokens (`--primary`, etc.) in `:root` and `.dark`. Full hex control.
 *  2) A curated shadcn palette baked in-code: set in app.config.ts
 *     `appearance: { enabled: true, baseColor: "zinc", theme: "blue", chartColor: "blue" }`.
 *  3) The same curated palette, dashboard-managed (PM One plan 010): saved via
 *     `site_config.appearance` on the project's website-settings, read through
 *     `useProjectSiteConfig().appearance`. Wins over the baked app.config
 *     value when present, so an operator can retheme without a rebuild - fail-open
 *     when the dashboard has not configured it (`docs/site-config-contract.md`,
 *     rule 2).
 *
 * Called from `app.vue` setup (not a plugin) so the read happens after all
 * plugins have run on the server and after hydration on the client — i.e. after
 * the `projectSettings` plugin resolved the `project-settings` payload — and the
 * resulting plain CSS string is handed to `useHead`, so no payload re-read
 * happens during head serialization. Emitted into the SSR `<head>` → no FOUC.
 */
export function useProjectAppearance(): void {
  const appConfig = useAppConfig();
  const siteConfig = useProjectSiteConfig();

  const baked = (appConfig.appearance as AppearanceOverride | undefined) ?? {};
  const dashboard = (siteConfig.appearance as AppearanceOverride | null) ?? {};
  // Normalized because the PM One dashboard form used to default its pickers to
  // neutral/neutral/neutral, so saved site_config carries that trio without
  // anyone having deliberately chosen Neutral three times.
  const appearance = normalizeAppearance({ ...DEFAULT_APPEARANCE, ...baked, ...dashboard });

  // Higher-specificity selector (:root:root) so the injected tokens
  // deterministically win over app.css `:root`/`.dark`, independent of <head>
  // tag order. Never an empty string when disabled — useHead does not reliably
  // patch a style back to "", which would leave stale tokens live.
  const css = appearance.enabled
    ? appearanceCss(appearance, {
        rootSelector: ":root:root",
        darkSelector: ":root:root.dark",
      })
    : ":root:root{}";

  useHead({
    style: [{ id: "appearance-vars", innerHTML: css }],
  });
}
