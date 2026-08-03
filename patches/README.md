# patches/

Applied automatically by pnpm via `pnpm.patchedDependencies` in the root
`package.json`. Each patch is pinned to an exact version — bumping that
dependency makes `pnpm install` fail with "patch not applied", which is the
intended signal to re-check whether the patch is still needed.

Currently there are no active patches.

## Dropped

### `nuxt@4.5.0.patch` — removed on the 4.5.1 upgrade

Nuxt's plugin transform used to detect a plugin's default export with
`findExports(code).find((e) => e.type === "default" || e.name === "default")`.
`mlly`'s `findExports` returns aliased list exports (`export { plugin as default }`)
as `{ type: "named", names: [...] }` — no `name` field — so the check missed them,
Nuxt logged `[NUXT_B2005] … has no default export and will be ignored at build
time`, and it replaced the plugin body with `export default () => {}`. Nuxt's own
`pages/runtime/plugins/check-if-page-unused.js` compiles to exactly that shape, so
the warning fired on every dev run and Nuxt silently disabled its own page
diagnostics (`NUXT_E4011` / `NUXT_E4016`).

Fixed upstream in Nuxt 4.5.1 (nuxt/nuxt#35676), which changed the check to
`e.names.includes('default')`. The patch is no longer needed.
