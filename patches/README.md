# patches/

Applied automatically by pnpm via `pnpm.patchedDependencies` in the root
`package.json`. Each patch is pinned to an exact version — bumping that
dependency makes `pnpm install` fail with "patch not applied", which is the
intended signal to re-check whether the patch is still needed.

## `nuxt@4.5.0.patch`

Nuxt's plugin transform detects a plugin's default export with

```js
findExports(code).find((e) => e.type === "default" || e.name === "default")
```

`mlly`'s `findExports` returns aliased list exports (`export { plugin as default }`)
as `{ type: "named", names: [...] }` — no `name` field — so the check misses
them. Nuxt then logs `[NUXT_B2005] … has no default export and will be ignored
at build time` and **replaces the plugin body with `export default () => {}`**.

Its own `pages/runtime/plugins/check-if-page-unused.js` is compiled to exactly
that shape, so on every dev run the warning fires and Nuxt silently disables its
own page diagnostics (`NUXT_E4011` / `NUXT_E4016`).

The patch adds `|| e.names?.includes("default")` to the check. Drop it once
upstream fixes the detection.
