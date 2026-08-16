import { LOCATIONS } from "./locations";
import { PUBLIC_PACKAGES } from "./packages";

/**
 * The only module `nuxt.config.ts` imports.
 *
 * It is loaded by jiti, outside the Nuxt app context, so nothing in the import
 * graph below it may touch a Nuxt auto-import. See the header of `types.ts`.
 *
 * Everything here is derived from the same arrays the pages read, which is what
 * keeps three things that must agree from drifting apart:
 *   - `staticPages.extra` (what gets prerendered)
 *   - `definePageMeta({ validate })` (what answers 200)
 *   - `sitemap.urls` (what we tell Google exists)
 *
 * A route seeded for prerender whose `validate` returns false renders a 404 and
 * hard-fails the build, so these three are not allowed to be authored twice.
 */

/** `/jatiluhur`, `/cikidang` */
export function locationRoutePaths(): string[] {
  return LOCATIONS.filter((location) => location.status !== "closed").map(
    (location) => `/${location.slug}`,
  );
}

/** `/jatiluhur/cabin`, `/cikidang/rafting-salamander`, … */
export function packageRoutePaths(): string[] {
  return PUBLIC_PACKAGES.map((pkg) => `/${pkg.locationSlug}/${pkg.slug}`);
}

/** Everything that has to be prerendered but is not a file-based static page. */
export function dynamicRoutePaths(): string[] {
  return [...locationRoutePaths(), ...packageRoutePaths()];
}

/**
 * URLs for `sitemap.urls`.
 *
 * Only the data-driven ones. The file-based static pages come from the
 * `nuxt:pages` source, which reads the route table *after* `pages:extend`
 * pruning, so pruned pages are already excluded.
 *
 * The `nuxt:prerender` source cannot help here: it reads `_prerenderedRoutes`
 * from a `nitro:config` virtual module evaluated before prerendering runs, and
 * its handler early-returns because `crawlLinks` is false.
 */
export function sitemapUrls(): string[] {
  return dynamicRoutePaths();
}

type RedirectRule = { redirect: { to: string; statusCode: 301 } };

/**
 * 301s from the old flat `/experiences/<slug>` tree to the branch-scoped URLs.
 *
 * Built from each package's own `legacySlug`, so renaming a slug can never
 * orphan its redirect.
 *
 * `statusCode` MUST sit inside `redirect`. Written as a sibling key nitro does
 * not read it and every redirect silently degrades to a 307.
 */
export function legacyExperienceRedirects(): Record<string, RedirectRule> {
  const rules: Record<string, RedirectRule> = {};

  for (const pkg of PUBLIC_PACKAGES) {
    if (!pkg.legacySlug) continue;
    rules[`/experiences/${pkg.legacySlug}`] = {
      redirect: { to: `/${pkg.locationSlug}/${pkg.slug}`, statusCode: 301 },
    };
  }

  return rules;
}
