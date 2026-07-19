import { createResolver, defineNuxtModule, addImports } from "@nuxt/kit";

/**
 * schema-org-stubs — no-op auto-imports while nuxt-schema-org is disabled.
 *
 * The module is turned off in every app (its unhead plugin is incompatible
 * with unhead v3 / Nuxt 4.5 and crashes head rendering; JSON-LD is emitted as
 * raw useHead scripts instead, see useEventSchema.js). But nuxt-seo-utils'
 * useBreadcrumbItems() imports `useSchemaOrg` and `defineBreadcrumb` from
 * #imports unconditionally, and unimport hard-fails the transform (500 on
 * every breadcrumb page) when those names are unregistered. Register no-op
 * stubs so the import resolves; the composable's schema push then does
 * nothing, which is the intended behavior while the module is off.
 *
 * Delete this module + mock/schema-org-stubs.mjs when nuxt-schema-org ships
 * an unhead-v3-compatible release and `schemaOrg.enabled` is turned back on.
 */
export default defineNuxtModule({
  meta: { name: "schema-org-stubs" },
  setup(_, nuxt) {
    const schemaOrgConfig = (nuxt.options as { schemaOrg?: { enabled?: boolean } }).schemaOrg;
    if (schemaOrgConfig?.enabled !== false) {
      return;
    }
    const resolver = createResolver(import.meta.url);
    const stubPath = resolver.resolve("../mock/schema-org-stubs.mjs");
    for (const name of ["useSchemaOrg", "defineBreadcrumb"]) {
      addImports({ name, from: stubPath });
    }
  },
});
