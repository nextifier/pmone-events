/**
 * campx data contract — the single source of truth for branches, packages,
 * categories, facilities, FAQs and social proof.
 *
 * HARD CONSTRAINTS (breaking any one of them breaks the build, not a page):
 *
 * 1. Every module under `app/data/` must stay PLAIN TypeScript. No Nuxt
 *    auto-imports (`computed`, `ref`, `useRuntimeConfig`), no `#imports`, no
 *    `.vue` imports, no `import.meta.*`, no Pinia. `nuxt.config.ts` imports
 *    `./app/data/routes` through jiti to seed `staticPages.extra` and
 *    `sitemap.urls`; a single Nuxt-only symbol here makes the config fail to
 *    load, which kills the build before any page renders.
 *
 * 2. Derived values (`fromAmount`, `toAmount`, lookup indexes) are computed by
 *    pure functions at module load, never hand-written. A hand-written
 *    derivation drifts, and drift here means a prerender seed or a 301 target
 *    pointing at a route that does not exist.
 *
 * 3. Optional fields are `null` / `[]`, never `undefined`, and the UI hides the
 *    whole section when they are empty. There is no separate visibility flag.
 *
 * These interfaces map 1:1 onto the future PM One CMS tables, so nullable here
 * means nullable there.
 */

export type LocationSlug = "jatiluhur" | "cikidang";

export type PackageType = "stay" | "activity" | "trip" | "outing" | "pass";

export type PackageStatus =
  | "available"
  | "maintenance"
  | "coming-soon"
  | "seasonal";

export type Audience = "personal" | "keluarga" | "grup" | "korporat";

export type BadgeVariant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "destructive"
  | "muted"
  | "outline";

/**
 * How a price is counted. `pax-night` and `unit-night` differ in what the
 * headline number multiplies by: per person per night versus per unit per
 * night. Jatiluhur quotes per person, Cikidang quotes per cabin/tentsite with
 * two people included.
 */
export type PriceUnit =
  | "pax"
  | "pax-night"
  | "unit-night"
  | "unit"
  | "boat"
  | "trip"
  | "session";

/**
 * An image, stored once in `media.ts` and referenced everywhere by `id`.
 *
 * Media used to be inlined into each package and location, which meant the same
 * photograph existed as three separate literals with three different alt texts,
 * and swapping it meant editing three places. This is the shape a CMS `media`
 * table would have.
 */
export interface MediaAsset {
  id: string;
  src: string;
  /** Required. An empty alt on a content image is an accessibility bug. */
  alt: string;
  /** Required. Both dimensions are needed to reserve space and avoid layout shift. */
  width: number;
  height: number;
  caption: string | null;
  credit: string | null;
}

/** What components receive after `media.ts` ids are resolved. */
export type MediaRef = MediaAsset;

export interface VideoRef {
  id: string;
  src: string;
  /** Required. A video with no poster paints a black box until it buffers. */
  poster: string;
  /** Describes the footage for anyone who cannot play it. */
  alt: string;
  width: number;
  height: number;
}

export interface PriceTier {
  id: string;
  label: string;
  /** IDR, integer. Never a formatted string. */
  amount: number;
  rateType: "weekday" | "weekend" | "flat" | "duration" | "capacity";
  /** Day numbers this tier applies to, `Date#getDay()` convention. */
  days: number[] | null;
  conditions: string | null;
  order: number;
}

export interface PriceExtra {
  id: string;
  label: string;
  amount: number;
  unit: PriceUnit;
  note: string | null;
}

export interface Pricing {
  /**
   * What the amounts are counted per. Single source: it used to be duplicated
   * as `Pricing.model` plus a `unit` on every tier, two fields encoding one
   * fact with nothing forcing them to agree.
   */
  unit: PriceUnit;
  currency: "IDR";
  tiers: PriceTier[];
  /** Derived by `derivePricing`. Cheapest tier — drives cards and price sort. */
  fromAmount: number;
  /** Derived by `derivePricing`. Priciest tier — drives AggregateOffer.highPrice. */
  toAmount: number;
  /** People already covered by the headline price. Cikidang cabin & tentsite: 2. */
  includedPax: number | null;
  extraPax: PriceExtra | null;
  extraBed: PriceExtra | null;
  minPax: number | null;
  maxPax: number | null;
  notes: string[];
  /**
   * `null` when nobody has told us. It was `true` on all 24 packages for a
   * while, asserted from nothing — no price list mentions tax. A price page
   * that claims "tax included" without a source is worse than one that stays
   * quiet, so the UI shows a tax line only when this is not null.
   */
  taxIncluded: boolean | null;
}

/**
 * When a package can actually be booked.
 *
 * Split out from `status` on purpose: `status` is the coarse switch ("open",
 * "under maintenance"), while this answers "which days, which months, and how
 * far ahead". `status: "seasonal"` without a `season` here is meaningless, and
 * `packages.ts` rejects that combination at module load.
 */
export interface Availability {
  /** Days of the week it runs, `Date#getDay()`. Empty = every day. */
  days: number[];
  /** Inclusive month-day window, "MM-DD". Null = all year. */
  season: { from: string; to: string; note: string | null } | null;
  /** Specific ISO dates the package is closed. */
  closedDates: string[];
  /** Minimum notice before the date, in days. */
  leadTimeDays: number | null;
  note: string | null;
}

/** What `derivePricing` accepts — everything except the two derived amounts. */
export type PricingInput = Omit<Pricing, "fromAmount" | "toAmount">;

export interface PackageBadge {
  slug: string;
  label: string;
  variant: BadgeVariant;
}

export interface Duration {
  minutes: number | null;
  nights: number | null;
  label: string;
}

export interface Capacity {
  min: number | null;
  max: number | null;
  unit: "pax" | "perahu" | "unit";
}

export interface AgeLimit {
  min: number | null;
  max: number | null;
  label: string;
}

export interface ItineraryStep {
  /** "07.30" or null for an unscheduled step. */
  time: string | null;
  title: string;
  description: string | null;
  order: number;
}

export interface ItineraryDay {
  day: number;
  label: string | null;
  steps: ItineraryStep[];
}

export interface OtaProvider {
  slug: OtaProviderSlug;
  name: string;
  icon: string;
  order: number;
}

export type OtaProviderSlug = "agoda" | "traveloka" | "tiket-com" | "trip-com";

export interface OtaLink {
  providerSlug: OtaProviderSlug;
  url: string;
  order: number;
}

export interface BookingChannels {
  whatsapp: {
    enabled: boolean;
    label: string | null;
    /**
     * Tokens replaced at render time by `useWhatsappBooking`:
     * {package} {location} {price} {url} {pax} {date}
     */
    template: string;
  };
  ota: OtaLink[];
  /** First-party checkout is out of scope; this only carries the notice copy. */
  onlineBooking: { enabled: false; note: string } | null;
}

export interface SeoFields {
  title: string | null;
  description: string | null;
  /** Authoring aid only. NEVER emitted as <meta name="keywords">. */
  keywords: string[];
  ogImage: string | null;
  noindex: boolean;
}

export interface Facility {
  slug: string;
  name: string;
  icon: string;
  group: "basic" | "comfort" | "service" | "activity";
  order: number;
}

export interface Category {
  slug: string;
  name: string;
  /**
   * The free-text category strings the old Pinia store used. Kept so the
   * migration is mechanical and auditable, and so nothing silently loses its
   * grouping.
   */
  legacyNames: string[];
  kind: PackageType;
  icon: string;
  description: string | null;
  order: number;
}

interface LocationZoneBase {
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  order: number;
}

/** Authored shape: references media by id. */
export interface LocationZoneInput extends LocationZoneBase {
  mediaId: string | null;
}

/** Resolved shape the components receive. */
export interface LocationZone extends LocationZoneBase {
  media: MediaRef | null;
}

export interface TravelRoute {
  from: string;
  distanceKm: number | null;
  durationMinutes: number;
  via: string;
  note: string | null;
}

export interface LocationAddress {
  /**
   * Street line. Nullable on purpose: a branch can open before its street
   * address is confirmed, and printing a guessed address is worse than
   * printing none. The address block renders the administrative lines and
   * skips this one when it is null.
   */
  line1: string | null;
  village: string | null;
  district: string;
  regency: string;
  province: string;
  postalCode: string | null;
  country: "ID";
}

export interface OperatingHours {
  checkIn: string | null;
  checkOut: string | null;
  dayTripOpen: string | null;
  dayTripClose: string | null;
  quietHours: string | null;
}

export interface LocationFile {
  label: string;
  href: string;
  icon: string;
}

interface LocationBase {
  id: string;
  slug: LocationSlug;
  name: string;
  shortName: string;
  tagline: string;
  status: "open" | "coming-soon" | "closed";
  /** ISO date. Drives the "Baru dibuka" badge for its first 90 days. */
  openedAt: string | null;
  order: number;
  address: LocationAddress;
  /**
   * Nullable for the same reason as `address.line1`: a fabricated pin sends
   * people to the wrong place. When null the map section and the geo JSON-LD
   * are both skipped.
   */
  geo: { lat: number; lng: number } | null;
  googleMapsUrl: string | null;
  /** null falls back to a coordinate-based embed rather than an empty iframe. */
  googleMapsEmbedSrc: string | null;
  landscape: "lakeside" | "riverside";
  distanceFromJakarta: { hours: number; label: string } | null;
  /** Plain text, one paragraph. Feeds the meta description fallback. */
  description: string;
  /** HTML, 400-600 words. The SEO body of the branch hub. */
  story: string;
  highlights: string[];
  facilitySlugs: string[];
  routes: TravelRoute[];
  hours: OperatingHours | null;
  entranceFee: { amount: number; unit: string; note: string | null } | null;
  capacity: {
    /** Marked-out camping plots. */
    campsite: number | null;
    campsiteSize: string | null;
    cabin: number | null;
    cabinSize: string | null;
    camperVan: number | null;
    camperVanSize: string | null;
    /** Seats in the open-air stage / amphitheatre. */
    amphitheatre: number | null;
    note: string | null;
  } | null;
  files: LocationFile[];
  bookingChannels: BookingChannels;
  nearby: { name: string; distanceKm: number | null; description: string }[];
  seo: SeoFields;
}

/** Authored shape: media referenced by id. */
export interface LocationInput extends LocationBase {
  heroMediaId: string;
  galleryIds: string[];
  siteMapImageId: string | null;
  videoId: string | null;
  zones: LocationZoneInput[];
}

/** Resolved shape the components receive. */
export interface Location extends LocationBase {
  heroMedia: MediaRef;
  gallery: MediaRef[];
  siteMapImage: MediaRef | null;
  video: VideoRef | null;
  zones: LocationZone[];
}

interface PackageBase {
  id: string;
  /** Unique WITHIN a location. Both branches have a `cabin`. */
  slug: string;
  /** The slug this package lived at under the old /experiences/* tree. */
  legacySlug: string | null;
  locationSlug: LocationSlug;
  type: PackageType;
  title: string;
  subtitle: string | null;
  shortDescription: string;
  /** HTML. Rendered into `.typeset.typeset-cms`. */
  description: string;
  categorySlugs: string[];
  audience: Audience[];
  badges: PackageBadge[];
  status: PackageStatus;
  statusNote: string | null;
  visibility: "public" | "hidden";
  order: number;
  pricing: Pricing;
  availability: Availability;
  duration: Duration | null;
  distanceKm: number | null;
  capacity: Capacity | null;
  ageLimit: AgeLimit | null;
  checkInOut: { in: string; out: string } | null;
  meetingPoint: string | null;
  included: string[];
  excluded: string[];
  itinerary: ItineraryDay[];
  /** Additive over the location's own facility list. */
  facilitySlugs: string[];
  requirements: string[];
  /** null inherits the location's channels. */
  bookingChannels: BookingChannels | null;
  /** null generates a template from the title and the branch short name. */
  whatsappTemplate: string | null;
  faqIds: string[];
  /** Empty falls back to the category + location algorithm. */
  relatedSlugs: string[];
  seo: SeoFields;
  updatedAt: string;
}

/** Authored shape: media referenced by id. */
export interface PackageInput extends PackageBase {
  /**
   * Null because a package can be sold before it has been photographed — the
   * Cikidang rafting and land activities are in exactly that state. The card
   * then paints a neutral placeholder carrying the category icon, which reads
   * as intentional. Borrowing an unrelated photo would not.
   */
  coverImageId: string | null;
  photoIds: string[];
  videoId: string | null;
}

/** Resolved shape the components receive. */
export interface Package extends PackageBase {
  coverImage: MediaRef | null;
  photos: MediaRef[];
  video: VideoRef | null;
}

export type FaqPage = "home" | "faq" | "location" | "package" | "outing";

export interface Faq {
  id: string;
  question: string;
  /** HTML. */
  answer: string;
  scope: {
    /** Empty means every branch. */
    locationSlugs: LocationSlug[];
    /** Empty means every category. */
    categorySlugs: string[];
  };
  /**
   * Which page types may render this question. It also decides where FAQPage
   * JSON-LD is emitted, so the same question set is never marked up twice.
   */
  showOnPages: FaqPage[];
  order: number;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string | null;
  locationSlug: LocationSlug;
  packageSlug: string | null;
  quote: string;
  source: "google" | "whatsapp" | "instagram" | "direct";
  sourceUrl: string | null;
  publishedAt: string;
  /** Media id, resolved through `media.ts` like every other image. */
  avatarId: string | null;
}

export interface MediaCoverage {
  id: string;
  outlet: string;
  title: string;
  url: string;
  /** Null when the article carries no reliable date. */
  publishedAt: string | null;
  locationSlug: LocationSlug | null;
}
