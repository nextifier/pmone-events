import type { MediaCoverage, Testimonial } from "./types";

/**
 * The Google (4.6) and TikTok (4.9) rating strip used to live here and render
 * in the hero. Removed Aug 2026: the figures were hand-copied, so they froze
 * the day they were typed and every later review made the page a little more
 * wrong. A rating that never moves reads as decoration, and there is no feed to
 * refresh it from.
 *
 * If it comes back it needs a live source, not a new constant. The same
 * constraint still applies either way: these are Google's and TikTok's scores
 * for the business, not reviews collected on campx.id, so they may be shown
 * with attribution but must NEVER be marked up as `aggregateRating` in JSON-LD.
 */

/**
 * Real, attributable quotes only.
 *
 * Ships empty on purpose. The testimonial section hides itself when this array
 * is empty, which is the correct behaviour — a made-up quote from a made-up
 * guest is worse than no section at all. Add entries as real ones are collected
 * with permission.
 */
export const TESTIMONIALS: Testimonial[] = [];

/** Press coverage. Genuine E-E-A-T signal, and useful proof for corporate buyers. */
export const MEDIA_COVERAGE: MediaCoverage[] = [
  {
    id: "detik-jabar",
    outlet: "detikJabar",
    title: "CampX, Kemah Sambil Nonton Panorama Indah Danau Jatiluhur",
    url: "https://www.detik.com/jabar/wisata/d-7187843/campx-kemah-sambil-nonton-panorama-indah-danau-jatiluhur",
    publishedAt: null,
    locationSlug: "jatiluhur",
  },
  {
    id: "trac-astra",
    outlet: "TRAC Astra",
    title: "CampX: Camping Ground Jatiluhur dengan View Menawan",
    url: "https://www.trac.astra.co.id/blog/travel/campx-camping-ground-jatiluhur-dengan-view-menawan/1651",
    publishedAt: null,
    locationSlug: "jatiluhur",
  },
  {
    id: "radar-depok",
    outlet: "Radar Depok",
    title:
      "Tempat Camping di Purwakarta Ini Punya Spot Terbaik Menikmati Waduk Jatiluhur",
    url: "https://www.radardepok.com/metropolis/94611026011/tempat-camping-di-purwakarta-ini-punya-spot-terbaik-menikmati-waduk-jatiluhur-yuk-intip-lokasinya",
    publishedAt: null,
    locationSlug: "jatiluhur",
  },
  {
    id: "sukabumi-update",
    outlet: "Sukabumi Update",
    title: "Seru Bisa Mancing! Cobain Camping di Tepi Waduk Jatiluhur Purwakarta",
    url: "https://www.sukabumiupdate.com/food-travel/134434/seru-bisa-mancing-cobain-camping-di-tepi-waduk-jatiluhur-purwakarta",
    publishedAt: null,
    locationSlug: "jatiluhur",
  },
];
