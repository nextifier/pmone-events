import { appearanceCss, DEFAULT_APPEARANCE } from "@/lib/appearance";

/**
 * OPT-IN per-project design tokens. Injects baseColor/theme/chartColor/radius
 * CSS vars ONLY when an app sets `appearance.enabled = true` in its app.config.ts.
 * When disabled (default), nothing is injected so each app keeps its native
 * palette from app.css (`:root`/`.dark` token overrides) — production look.
 *
 * Two ways to theme a project (both in-code, per app):
 *  1) Custom brand palette (recommended for branded sites like iicc/megabuild):
 *     edit that app's `app/assets/css/app.css` — override `--color-gray-*` and
 *     semantic tokens (`--primary`, etc.) in `:root` and `.dark`. Full hex control.
 *  2) A curated shadcn palette (quick, no hex): set in app.config.ts
 *     `appearance: { enabled: true, baseColor: "zinc", theme: "blue", chartColor: "blue" }`.
 *     This overrides the semantic tokens with the named palette.
 *
 * Token-only — components/ui untouched.
 */
export default defineNuxtPlugin(() => {
  const appConfig = useAppConfig();
  const appearance = appConfig.appearance as
    | (Partial<typeof DEFAULT_APPEARANCE> & { enabled?: boolean })
    | undefined;

  if (!appearance || !appearance.enabled) {
    return;
  }

  const config = { ...DEFAULT_APPEARANCE, ...appearance };
  // Use a higher-specificity selector (:root:root) so the injected tokens
  // deterministically win over the app's app.css `:root`/`.dark` overrides,
  // independent of <head> tag order.
  const css = appearanceCss(config, {
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
});
