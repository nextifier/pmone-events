import type { Category } from "./types";

/**
 * Package taxonomy.
 *
 * `legacyNames` carries the free-text strings the old Pinia store used
 * (`app/composables/experiences.js`), so the migration is mechanical and every
 * old grouping can be audited against a new one.
 *
 * Two old values deliberately have no category here:
 *  - "Paket Personal" was an audience, not a category → `Package.audience`
 *  - "Activity" was too coarse → split into `aktivitas-air` / `aktivitas-darat`
 */
export const CATEGORIES: Category[] = [
  {
    slug: "camping",
    name: "Camping",
    legacyNames: ["Camping"],
    kind: "stay",
    icon: "hugeicons:tent",
    description: "Menginap di tenda, bawa sendiri atau tinggal datang.",
    order: 10,
  },
  {
    slug: "cabin",
    name: "Cabin",
    legacyNames: ["Cabin"],
    kind: "stay",
    icon: "hugeicons:home-05",
    description: "Bangunan tertutup dengan kasur, buat yang mau nyaman tanpa repot.",
    order: 20,
  },
  {
    slug: "day-trip",
    name: "Day trip",
    legacyNames: ["Day Trip"],
    kind: "pass",
    icon: "hugeicons:sunrise",
    description: "Datang pagi, pulang sore. Tanpa menginap.",
    order: 30,
  },
  {
    slug: "rafting",
    name: "Rafting",
    legacyNames: [],
    kind: "activity",
    icon: "hugeicons:kayak",
    description: "Arung jeram dengan pemandu, tim rescue, dan asuransi.",
    order: 40,
  },
  {
    slug: "aktivitas-air",
    name: "Aktivitas air",
    legacyNames: ["Activity"],
    kind: "activity",
    icon: "hugeicons:boat",
    description: "Semua yang dilakukan di atas air.",
    order: 50,
  },
  {
    slug: "aktivitas-darat",
    name: "Aktivitas darat",
    legacyNames: [],
    kind: "activity",
    icon: "hugeicons:mountain",
    description: "Adrenalin dan permainan di darat.",
    order: 60,
  },
  {
    slug: "trip",
    name: "Trip",
    legacyNames: [],
    kind: "trip",
    icon: "hugeicons:route-01",
    description: "Perjalanan keluar area dengan rute dan jadwal tetap.",
    order: 70,
  },
  {
    slug: "outing",
    name: "Outing",
    legacyNames: ["Paket Grup"],
    kind: "outing",
    icon: "hugeicons:user-group-02",
    description: "Paket rombongan untuk kantor, komunitas, dan sekolah.",
    order: 80,
  },
  {
    slug: "team-building",
    name: "Team building",
    legacyNames: ["Team Building"],
    kind: "outing",
    icon: "hugeicons:puzzle",
    description: "Sesi terpandu untuk mengakrabkan tim.",
    order: 90,
  },
];

const BY_SLUG = new Map(CATEGORIES.map((category) => [category.slug, category]));

export function getCategory(slug: string): Category | null {
  return BY_SLUG.get(slug) ?? null;
}

export function resolveCategories(slugs: string[]): Category[] {
  const wanted = new Set(slugs);
  return CATEGORIES.filter((category) => wanted.has(category.slug));
}
