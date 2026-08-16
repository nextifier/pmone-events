import type { Facility } from "./types";

/**
 * Facility catalog shared by both branches and (additively) by packages.
 *
 * Every icon name here was checked against @iconify-json/hugeicons. An icon
 * name that does not exist renders nothing at all — no error, no fallback — so
 * do not add a slug without confirming its icon resolves.
 */
export const FACILITIES: Facility[] = [
  // basic — the things a guest assumes and notices only when missing
  { slug: "toilet", name: "Toilet", icon: "hugeicons:toilet-01", group: "basic", order: 10 },
  { slug: "kamar-mandi", name: "Kamar mandi", icon: "hugeicons:bathtub-01", group: "basic", order: 20 },
  { slug: "shower", name: "Shower air bersih", icon: "hugeicons:shower-head", group: "basic", order: 30 },
  { slug: "air-bersih", name: "Air bersih", icon: "hugeicons:droplet", group: "basic", order: 40 },
  { slug: "listrik", name: "Listrik di kavling", icon: "hugeicons:plug-socket", group: "basic", order: 50 },
  { slug: "parkir", name: "Area parkir", icon: "hugeicons:car-parking-01", group: "basic", order: 60 },
  { slug: "musholla", name: "Musholla", icon: "hugeicons:mosque-01", group: "basic", order: 70 },

  // comfort — the reasons someone picks this campground over the next one
  { slug: "wifi", name: "WiFi", icon: "hugeicons:wifi-01", group: "comfort", order: 110 },
  { slug: "api-unggun", name: "Area api unggun", icon: "hugeicons:campfire", group: "comfort", order: 120 },
  { slug: "dapur-bersama", name: "Dapur bersama", icon: "hugeicons:bbq-grill", group: "comfort", order: 130 },
  { slug: "tenda-terpasang", name: "Tenda sudah terpasang", icon: "hugeicons:tent", group: "comfort", order: 140 },
  { slug: "kasur", name: "Kasur & bantal", icon: "hugeicons:bed-double", group: "comfort", order: 150 },
  { slug: "meja-kursi", name: "Set meja & kursi", icon: "hugeicons:dining-table", group: "comfort", order: 160 },

  // service — staffed, not built
  { slug: "resepsionis", name: "Lobby & resepsionis", icon: "hugeicons:hotel-bell", group: "service", order: 210 },
  { slug: "support-24-jam", name: "Bantuan 24 jam", icon: "hugeicons:customer-support", group: "service", order: 220 },
  { slug: "keamanan", name: "Keamanan area", icon: "hugeicons:shield-01", group: "service", order: 230 },
  { slug: "p3k", name: "Kotak P3K", icon: "hugeicons:first-aid-kit", group: "service", order: 240 },
  { slug: "dokumentasi", name: "Dokumentasi kegiatan", icon: "hugeicons:camera-01", group: "service", order: 250 },

  // activity — the places you go and do something
  { slug: "aula", name: "Aula terbuka", icon: "hugeicons:conference", group: "activity", order: 310 },
  { slug: "spot-foto", name: "Spot foto", icon: "hugeicons:image-01", group: "activity", order: 320 },
  { slug: "dermaga", name: "Dermaga perahu", icon: "hugeicons:anchor", group: "activity", order: 330 },
  { slug: "jembatan-gantung", name: "Jembatan gantung", icon: "hugeicons:bridge", group: "activity", order: 340 },
  { slug: "sungai", name: "Akses sungai", icon: "hugeicons:kayak", group: "activity", order: 350 },
  { slug: "danau", name: "Akses danau", icon: "hugeicons:boat", group: "activity", order: 360 },

  // From the Jatiluhur venue guide. These are what a corporate buyer asks about
  // before anything else, so they are named as the deck names them.
  { slug: "meeting-room", name: "Meeting room", icon: "hugeicons:presentation-01", group: "activity", order: 370 },
  { slug: "open-stage", name: "Open stage amfiteater", icon: "hugeicons:speaker", group: "activity", order: 380 },
  { slug: "welcome-area", name: "Welcome area", icon: "hugeicons:flag-01", group: "activity", order: 390 },
  { slug: "team-building-area", name: "Lapangan team building", icon: "hugeicons:puzzle", group: "activity", order: 400 },
  { slug: "cafe", name: "Cafe & restoran", icon: "hugeicons:restaurant-02", group: "comfort", order: 170 },
  { slug: "warung", name: "Warung", icon: "hugeicons:store-01", group: "comfort", order: 180 },
  { slug: "sound-system", name: "Sound system", icon: "hugeicons:speaker-01", group: "service", order: 260 },
];

const BY_SLUG = new Map(FACILITIES.map((facility) => [facility.slug, facility]));

export function getFacility(slug: string): Facility | null {
  return BY_SLUG.get(slug) ?? null;
}

/** Resolves a slug list to facilities, dropping unknown slugs and keeping catalog order. */
export function resolveFacilities(slugs: string[]): Facility[] {
  const wanted = new Set(slugs);
  return FACILITIES.filter((facility) => wanted.has(facility.slug));
}
