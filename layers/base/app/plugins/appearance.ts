import { appearanceCss, DEFAULT_APPEARANCE } from "@/lib/appearance";

type AppearanceOverride = Partial<typeof DEFAULT_APPEARANCE> & { enabled?: boolean };

/**
 * OPT-IN per-project design tokens. Injects baseColor/theme/chartColor/radius
 * CSS vars ONLY when the merged config below resolves `enabled: true`. When
 * disabled (default), nothing is injected so each app keeps its native
 * palette from app.css (`:root`/`.dark` token overrides) — production look.
 *
 * Three ways to theme a project, in increasing precedence:
 *  1) Custom brand palette (recommended for branded sites like iicc/megabuild):
 *     edit that app's `app/assets/css/app.css` — override `--color-gray-*` and
 *     semantic tokens (`--primary`, etc.) in `:root` and `.dark`. Full hex control.
 *  2) A curated shadcn palette baked in-code: set in app.config.ts
 *     `appearance: { enabled: true, baseColor: "zinc", theme: "blue", chartColor: "blue" }`.
 *  3) The same curated palette, dashboard-managed (PM One plan 010): saved via
 *     `site_config.appearance` on the project's website-settings, read through
 *     `useSiteConfig().appearance`. Wins over the baked app.config value when
 *     present, so an operator can retheme without a rebuild - fail-open when
 *     the dashboard has not configured it (`docs/site-config-contract.md`,
 *     rule 2).
 *
 * Token-only — components/ui untouched.
 *
 * `dependsOn: ["projectSettings"]` ensures this plugin's `setup()` runs only
 * after the `projectSettings` plugin has awaited the website-settings payload
 * on the server, so `useSiteConfig().appearance` below reads the *resolved*
 * value instead of racing it (filename sort alone would run "appearance"
 * before "projectSettings"). Because this stays a universal (non-`.client`)
 * plugin, the resulting `<style id="appearance-vars">` is emitted via
 * `useHead` into the server-rendered `<head>` - no flash-of-unstyled-content.
 */
export default defineNuxtPlugin({
  name: "appearance",
  dependsOn: ["projectSettings"],
  setup() {
    const appConfig = useAppConfig();
    const siteConfig = useSiteConfig();

    const baked = (appConfig.appearance as AppearanceOverride | undefined) ?? {};
    // Resolved by the projectSettings dependency above; null when the project
    // has never saved a dashboard palette.
    const dashboard = (siteConfig.appearance as AppearanceOverride | null) ?? {};
    const appearance = { ...DEFAULT_APPEARANCE, ...baked, ...dashboard };

    if (!appearance.enabled) {
      return;
    }

    // Use a higher-specificity selector (:root:root) so the injected tokens
    // deterministically win over the app's app.css `:root`/`.dark` overrides,
    // independent of <head> tag order.
    const css = appearanceCss(appearance, {
      rootSelector: ":root:root",
      darkSelector: ":root:root.dark",
    });
    useHead({
      style: [
        {
          id: "appearance-vars",
          innerHTML: css,
        },
      ],
    });
  },
});
