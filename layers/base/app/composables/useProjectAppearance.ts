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
 * Two ways to theme a project, in increasing precedence:
 *  1) Custom brand palette (recommended for branded sites like iicc/megabuild):
 *     edit that app's `app/assets/css/app.css` — override `--color-gray-*` and
 *     semantic tokens (`--primary`, etc.) in `:root` and `.dark`. Full hex control.
 *  2) A curated shadcn palette baked in-code: set in app.config.ts
 *     `appearance: { enabled: true, baseColor: "zinc", theme: "blue", chartColor: "blue" }`.
 *
 * A third, dashboard-managed layer (`site_config.appearance`) existed between
 * Jun and Aug 2026 and was removed with the rest of the website-settings
 * pipeline: a prerendered page would freeze the palette into its HTML anyway.
 * Only megabuild had ever saved one, with `enabled: false`, so nothing changed.
 *
 * Called from `app.vue` setup (not a plugin) so the resulting plain CSS string
 * is handed to `useHead` before head serialization. Emitted into the SSR
 * `<head>` → no FOUC.
 */
export function useProjectAppearance(): void {
  const appConfig = useAppConfig();

  const baked = (appConfig.appearance as AppearanceOverride | undefined) ?? {};
  // Normalized because the retired dashboard form defaulted its pickers to
  // neutral/neutral/neutral, and an app.config copied from a saved payload can
  // still carry that trio without anyone having chosen Neutral three times.
  const appearance = normalizeAppearance({ ...DEFAULT_APPEARANCE, ...baked });

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
