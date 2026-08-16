/**
 * Barrel for app code. `nuxt.config.ts` imports `./app/data/routes` directly
 * instead of this file, to keep the config's import graph as small as possible.
 *
 * Everything re-exported here is plain data or a pure function. Nothing in this
 * tree may touch a Nuxt auto-import — see the header of `types.ts`.
 */
export * from "./types";

export { CATEGORIES, getCategory, resolveCategories } from "./categories";
export { FACILITIES, getFacility, resolveFacilities } from "./facilities";
export { FAQS, faqsFor } from "./faqs";
export {
  LOCATIONS,
  LOCATION_SLUGS,
  getLocation,
  isLocationSlug,
  otherLocations,
} from "./locations";
export {
  CIKIDANG_OTA_LINKS,
  JATILUHUR_OTA_LINKS,
  OTA_PROVIDERS,
  getOtaProvider,
  resolveOtaLinks,
} from "./ota";
export {
  PACKAGES,
  PUBLIC_PACKAGES,
  getPackage,
  getPackageById,
  lowestPriceAt,
  packageExists,
  packagesByCategory,
  packagesByLocation,
  packagesByType,
  relatedPackages,
} from "./packages";
export { derivePricing, durationRates, flatRate, weekdayWeekendRates } from "./pricing";
export {
  dynamicRoutePaths,
  legacyExperienceRedirects,
  locationRoutePaths,
  packageRoutePaths,
  sitemapUrls,
} from "./routes";
export { MEDIA_COVERAGE, TESTIMONIALS } from "./social-proof";
