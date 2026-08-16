import { mediaList, optionalMedia, optionalVideo } from "./media";
import { CIKIDANG_PACKAGE_INPUTS } from "./packages.cikidang";
import { JATILUHUR_PACKAGE_INPUTS } from "./packages.jatiluhur";
import type { LocationSlug, Package, PackageInput } from "./types";

/**
 * Swaps media ids for the assets they name.
 *
 * Same reasoning as `resolveLocation`: a typo throws while `nuxt.config.ts` is
 * still being read, so the build stops with the offending id in the message
 * rather than rendering a page with a hole where a photo should be.
 */
function resolvePackage(input: PackageInput): Package {
  const { coverImageId, photoIds, videoId, ...rest } = input;

  return {
    ...rest,
    coverImage: optionalMedia(coverImageId),
    photos: mediaList(photoIds),
    video: optionalVideo(videoId),
  };
}

/**
 * Every CampX package, both branches, in one ordered list.
 *
 * The integrity checks at the bottom run at module load. That is on purpose:
 * `nuxt.config.ts` imports this module to seed prerender routes and the
 * sitemap, so a duplicate slug or a dangling `relatedSlugs` entry stops the
 * build with a named error instead of shipping a 404 that nobody notices.
 */
export const PACKAGES: Package[] = [
  ...JATILUHUR_PACKAGE_INPUTS,
  ...CIKIDANG_PACKAGE_INPUTS,
]
  .map(resolvePackage)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "id"));

/** Only these are routed, prerendered, listed and put in the sitemap. */
export const PUBLIC_PACKAGES: Package[] = PACKAGES.filter(
  (pkg) => pkg.visibility === "public",
);

const key = (locationSlug: string, slug: string) => `${locationSlug}/${slug}`;

const BY_KEY = new Map(PUBLIC_PACKAGES.map((pkg) => [key(pkg.locationSlug, pkg.slug), pkg]));
const BY_ID = new Map(PACKAGES.map((pkg) => [pkg.id, pkg]));

export function getPackage(locationSlug: string, slug: string): Package | null {
  return BY_KEY.get(key(locationSlug, slug)) ?? null;
}

export function getPackageById(id: string): Package | null {
  return BY_ID.get(id) ?? null;
}

/**
 * The predicate `pages/[location]/[slug].vue` validates against, and the same
 * source `routes.ts` builds prerender paths from. Keeping both on one function
 * is what stops a seeded route from 404ing and hard-failing the build.
 */
export function packageExists(locationSlug: string, slug: string): boolean {
  return BY_KEY.has(key(locationSlug, slug));
}

export function packagesByLocation(locationSlug: LocationSlug): Package[] {
  return PUBLIC_PACKAGES.filter((pkg) => pkg.locationSlug === locationSlug);
}

export function packagesByType(type: Package["type"], locationSlug?: LocationSlug): Package[] {
  return PUBLIC_PACKAGES.filter(
    (pkg) => pkg.type === type && (!locationSlug || pkg.locationSlug === locationSlug),
  );
}

export function packagesByCategory(categorySlug: string, locationSlug?: LocationSlug): Package[] {
  return PUBLIC_PACKAGES.filter(
    (pkg) =>
      pkg.categorySlugs.includes(categorySlug) &&
      (!locationSlug || pkg.locationSlug === locationSlug),
  );
}

/**
 * Related packages, in decreasing order of relevance:
 * hand-picked → same branch and category → same branch → same category elsewhere.
 *
 * Hand-picked entries are resolved within the same branch, which is why the
 * data only ever stores a bare slug.
 */
export function relatedPackages(pkg: Package, limit = 6): Package[] {
  const picked = pkg.relatedSlugs
    .map((slug) => getPackage(pkg.locationSlug, slug))
    .filter((entry): entry is Package => entry !== null);

  const seen = new Set([pkg.id, ...picked.map((entry) => entry.id)]);
  const take = (candidates: Package[]) =>
    candidates.filter((candidate) => {
      if (seen.has(candidate.id)) return false;
      seen.add(candidate.id);
      return true;
    });

  const sameBranchAndCategory = take(
    PUBLIC_PACKAGES.filter(
      (candidate) =>
        candidate.locationSlug === pkg.locationSlug &&
        candidate.categorySlugs.some((slug) => pkg.categorySlugs.includes(slug)),
    ),
  );

  const sameBranch = take(
    PUBLIC_PACKAGES.filter((candidate) => candidate.locationSlug === pkg.locationSlug),
  );

  const sameCategoryElsewhere = take(
    PUBLIC_PACKAGES.filter((candidate) =>
      candidate.categorySlugs.some((slug) => pkg.categorySlugs.includes(slug)),
    ),
  );

  return [...picked, ...sameBranchAndCategory, ...sameBranch, ...sameCategoryElsewhere].slice(
    0,
    limit,
  );
}

/** Cheapest public package at a branch. Drives the "mulai dari" line on hubs. */
export function lowestPriceAt(locationSlug: LocationSlug): number | null {
  const amounts = packagesByLocation(locationSlug).map((pkg) => pkg.pricing.fromAmount);
  return amounts.length ? Math.min(...amounts) : null;
}

// ---------------------------------------------------------------------------
// Integrity checks. These run once, at import time, in Node during the build.
// ---------------------------------------------------------------------------

function assertUnique(values: string[], what: string): void {
  const seen = new Set<string>();
  const duplicates = values.filter((value) => {
    if (seen.has(value)) return true;
    seen.add(value);
    return false;
  });
  if (duplicates.length) {
    throw new Error(`[campx/data] Duplicate ${what}: ${[...new Set(duplicates)].join(", ")}`);
  }
}

assertUnique(
  PACKAGES.map((pkg) => pkg.id),
  "package id",
);

assertUnique(
  PUBLIC_PACKAGES.map((pkg) => key(pkg.locationSlug, pkg.slug)),
  "location/slug pair",
);

assertUnique(
  PACKAGES.map((pkg) => pkg.legacySlug).filter((slug): slug is string => Boolean(slug)),
  "legacy slug",
);

for (const pkg of PACKAGES) {
  for (const slug of pkg.relatedSlugs) {
    if (!packageExists(pkg.locationSlug, slug)) {
      throw new Error(
        `[campx/data] ${pkg.id} lists relatedSlugs "${slug}", which does not exist at ${pkg.locationSlug}.`,
      );
    }
  }

  // "Seasonal" with no season is a badge that says "sometimes" and never says
  // when. Either the window is recorded or the status is wrong.
  if (pkg.status === "seasonal" && pkg.availability.season === null) {
    throw new Error(
      `[campx/data] ${pkg.id} is status "seasonal" but has no availability.season. Record the window, or use a different status.`,
    );
  }
}
