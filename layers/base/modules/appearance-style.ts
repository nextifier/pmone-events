import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { addTemplate, createResolver, defineNuxtModule, useLogger } from "@nuxt/kit";

/**
 * appearance-style — picks the shadcn "Style" (component SHAPE: radius, padding,
 * border, shadow per component) for THIS app, from a single knob:
 *
 *     // apps/<app>/nuxt.config.ts
 *     appearance: { style: "luma" },
 *
 * Available names = the `layers/base/app/assets/css/styles/style-<name>.css`
 * files (mono, vega, nova, maia, lyra, mira, luma, sera, rhea). Default: mono.
 *
 * One value drives BOTH halves of the system, so they can never disagree:
 *
 *  1. CSS — a generated `<buildDir>/appearance-style.css` holds the `@import`s
 *     (plus `_base.css`, which every non-mono style is a diff on top of), and is
 *     reachable as `#appearance-style`. `main.css` imports that one specifier,
 *     so ONLY the selected style is ever compiled — no dead weight.
 *  2. `<body class="style-X">` — written to appConfig and read by
 *     `useAppearance()`. Build-time only (an env var must never be able to move
 *     the body class away from the CSS that was actually bundled).
 *
 * The generated file lives in the app's own buildDir, never in layers/base:
 * `pnpm build:all` runs the apps in parallel and would race on a shared file.
 *
 * Auto-registered — Nuxt scans each layer's `modules/` directory.
 */

export interface ModuleOptions {
  /** shadcn Style name — must match a `styles/style-<name>.css` file. */
  style?: string;
}

export default defineNuxtModule<ModuleOptions>({
  meta: { name: "appearance-style", configKey: "appearance" },
  defaults: { style: "mono" },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const stylesDir = resolver.resolve("../app/assets/css/styles");
    const style = options.style || "mono";
    const stylePath = join(stylesDir, `style-${style}.css`);

    if (!existsSync(stylePath)) {
      const available = readdirSync(stylesDir)
        .filter(f => f.startsWith("style-") && f.endsWith(".css"))
        .map(f => f.slice("style-".length, -".css".length))
        .sort();
      throw new Error(
        `[appearance-style] Unknown style "${style}" (no ${stylePath}). Available: ${available.join(", ")}`,
      );
    }

    // mono is a self-contained clone of the shadcn base; every other style is a
    // diff on top of _base.css, so _base has to be imported first.
    const files = style === "mono"
      ? [stylePath]
      : [join(stylesDir, "_base.css"), stylePath];

    addTemplate({
      filename: "appearance-style.css",
      // Tailwind resolves @import specifiers through Vite but READS the target
      // from disk, so this has to be a real file, not a virtual module.
      write: true,
      getContents: () => `${files.map(f => `@import ${JSON.stringify(f)};`).join("\n")}\n`,
    });

    nuxt.options.alias["#appearance-style"] = join(nuxt.options.buildDir, "appearance-style.css");

    // Build-time only, and deliberately NOT `runtimeConfig`: no env var may move
    // the body class away from the CSS that was actually bundled. (Cast because
    // AppConfigInput has no index signature; the key is ours.)
    (nuxt.options.appConfig as Record<string, unknown>).appearance = { style };

    useLogger("appearance-style").info(`Style: ${style}`);
  },
});
