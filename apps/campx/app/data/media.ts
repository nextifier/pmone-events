import type { MediaAsset, VideoRef } from "./types";

/**
 * Every image and video on the site, stored once and referenced by id.
 *
 * Before this file, media was inlined into each package and location. The same
 * riverside photograph existed as three separate literals with three different
 * alt texts, and replacing it meant finding all three. This is the shape a CMS
 * `media` table has, so the eventual import is a straight copy.
 *
 * Dimensions are the real pixel dimensions of the file on disk. They are not
 * decoration: `<NuxtImg>` uses them to reserve space, and a wrong pair produces
 * layout shift that no test catches.
 *
 * NOT IN HERE: `public/img/experiences/cover-*.jpg`. Those twelve files are
 * Instagram promo posters with the headline, price and logo baked into the
 * pixels. They are not photography and nothing should reference them.
 */

const img = (
  id: string,
  src: string,
  alt: string,
  width: number,
  height: number,
): MediaAsset => ({ id, src, alt, width, height, caption: null, credit: null });

/**
 * The 20-frame cabin set, the only real Jatiluhur photography we had to start
 * with. Frame 3 is the strongest of the set (cabin against the open water) and
 * carries a written alt instead of the generated one, because it is used as the
 * branch hero where the description does real work.
 */
const CABIN_ALT: Record<number, string> = {
  1: "Cabin A-frame CampX Jatiluhur dilihat dari tepi air",
  3: "Cabin A-frame CampX Jatiluhur dengan pemandangan Waduk Jatiluhur",
  5: "Teras cabin CampX Jatiluhur menghadap Waduk Jatiluhur",
  8: "Suasana sore di area cabin CampX Jatiluhur",
  11: "Interior cabin CampX Jatiluhur",
  14: "Perbukitan di seberang Waduk Jatiluhur dilihat dari area CampX",
  17: "Area menginap CampX Jatiluhur di tepi waduk",
};

const cabinFrames: MediaAsset[] = Array.from({ length: 20 }, (_, index) => {
  const n = index + 1;
  return img(
    `jatiluhur-cabin-${String(n).padStart(2, "0")}`,
    `/img/experiences/cabin/${n}.jpg`,
    CABIN_ALT[n] ?? `Cabin X CampX Jatiluhur, foto ${n} dari 20`,
    1080,
    1350,
  );
});

export const MEDIA: MediaAsset[] = [
  // --- Jatiluhur ---
  ...cabinFrames,
  img(
    "jatiluhur-tenda-01",
    "/img/jatiluhur/tenda/tenda-01.webp",
    "Tenda CampX Jatiluhur yang sudah terpasang di bawah pepohonan, lampu menyala di dalamnya",
    1500,
    2000,
  ),
  img(
    "jatiluhur-tenda-02",
    "/img/jatiluhur/tenda/tenda-02.webp",
    "Tenda CampX Jatiluhur terbuka memperlihatkan matras di dalamnya",
    1500,
    2000,
  ),
  img(
    "jatiluhur-tenda-malam-01",
    "/img/jatiluhur/tenda/tenda-malam-01.webp",
    "Bagian dalam tenda CampX Jatiluhur pada malam hari dengan lampu gantung dan dua matras",
    1500,
    2000,
  ),
  img(
    "jatiluhur-tenda-malam-02",
    "/img/jatiluhur/tenda/tenda-malam-02.webp",
    "Lampu tenda menyala di dalam tenda CampX Jatiluhur pada malam hari",
    1500,
    2000,
  ),
  img(
    "jatiluhur-kavling-01",
    "/img/jatiluhur/kavling-tepi-air-01.webp",
    "Kavling camping CampX Jatiluhur dengan tenda terpasang di antara pepohonan",
    1500,
    2000,
  ),
  img(
    "jatiluhur-outing",
    "/img/outing-img.jpeg",
    "Rombongan outing kantor berkumpul di area CampX Jatiluhur",
    867,
    1156,
  ),

  // --- Cikidang ---
  img(
    "cikidang-riverside-01",
    "/img/cikidang/fasilitas/riverside-01.webp",
    "Tenda dan dua orang duduk di tepi Sungai Citarik, CampX Cikidang, saat matahari terbit",
    1086,
    1448,
  ),
  img(
    "cikidang-riverside-02",
    "/img/cikidang/fasilitas/riverside-02.webp",
    "Area camping Riverside CampX Cikidang di tepi Sungai Citarik",
    1086,
    1448,
  ),
  img(
    "cikidang-riverside-03",
    "/img/cikidang/fasilitas/riverside-03.webp",
    "Sungai Citarik yang berarus di sisi area camping CampX Cikidang",
    1086,
    1448,
  ),
  img(
    "cikidang-riverside-04",
    "/img/cikidang/fasilitas/riverside-04.webp",
    "Bebatuan di tepi Sungai Citarik, area Riverside CampX Cikidang",
    1086,
    1448,
  ),
  img(
    "cikidang-lapang-riung-01",
    "/img/cikidang/fasilitas/lapang-riung-01.webp",
    "Lapang Riung, area campground Middle Point CampX Cikidang saat matahari sore",
    1086,
    1448,
  ),
  img(
    "cikidang-lapang-riung-02",
    "/img/cikidang/fasilitas/lapang-riung-02.webp",
    "Area campground Middle Point CampX Cikidang dari sudut lain",
    1086,
    1448,
  ),
  img(
    "cikidang-jembatan-gantung",
    "/img/cikidang/fasilitas/jembatan-gantung.webp",
    "Jembatan gantung menyeberang Sungai Citarik di CampX Cikidang saat matahari terbenam",
    1086,
    1448,
  ),
  img(
    "cikidang-taman-batu",
    "/img/cikidang/fasilitas/taman-batu.webp",
    "Taman Batu, hamparan bebatuan besar yang jadi spot foto di CampX Cikidang",
    1086,
    1448,
  ),
  img(
    "cikidang-aula-01",
    "/img/cikidang/fasilitas/aula-01.webp",
    "Aula bambu terbuka dengan meja dan kursi di CampX Cikidang",
    1086,
    1448,
  ),
  img(
    "cikidang-aula-02",
    "/img/cikidang/fasilitas/aula-02.webp",
    "Aula bambu terbuka CampX Cikidang dari sisi samping",
    1086,
    1448,
  ),
  img(
    "cikidang-parkir",
    "/img/cikidang/fasilitas/parkir.webp",
    "Area parkir CampX Cikidang",
    1086,
    1448,
  ),
  img(
    "cikidang-wastafel",
    "/img/cikidang/fasilitas/wastafel.webp",
    "Wastafel bersama dengan tiga wastafel batu di CampX Cikidang",
    1445,
    1089,
  ),
  img(
    "cikidang-kamar-mandi",
    "/img/cikidang/fasilitas/kamar-mandi.webp",
    "Kamar mandi CampX Cikidang",
    1086,
    1448,
  ),
  img(
    "cikidang-shower",
    "/img/cikidang/fasilitas/shower.webp",
    "Shower air bersih di CampX Cikidang",
    1086,
    1448,
  ),
  img(
    "cikidang-toilet",
    "/img/cikidang/fasilitas/toilet.webp",
    "Toilet CampX Cikidang",
    1086,
    1448,
  ),
  img(
    "cikidang-saung-rumbia",
    "/img/cikidang/cabin/saung-rumbia.webp",
    "Saung Rumbia, cabin A-frame beratap rumbia dengan deck kayu di CampX Cikidang",
    1086,
    1448,
  ),
  img(
    "cikidang-cabin-eksterior-01",
    "/img/cikidang/cabin/eksterior-01.webp",
    "Tampak depan Saung Rumbia CampX Cikidang",
    1086,
    1448,
  ),
  img(
    "cikidang-cabin-eksterior-02",
    "/img/cikidang/cabin/eksterior-02.webp",
    "Deretan Saung Rumbia di area cabin CampX Cikidang",
    1086,
    1448,
  ),
  img(
    "cikidang-cabin-eksterior-03",
    "/img/cikidang/cabin/eksterior-03.webp",
    "Saung Rumbia CampX Cikidang dari sisi samping",
    1448,
    1086,
  ),
  img(
    "cikidang-cabin-interior",
    "/img/cikidang/cabin/interior.webp",
    "Interior Saung Rumbia dengan dinding dan langit-langit kayu",
    1086,
    1448,
  ),
  img(
    "cikidang-cabin-tempat-tidur-01",
    "/img/cikidang/cabin/tempat-tidur-01.webp",
    "Tempat tidur di dalam Saung Rumbia CampX Cikidang",
    1086,
    1448,
  ),
  img(
    "cikidang-cabin-tempat-tidur-02",
    "/img/cikidang/cabin/tempat-tidur-02.webp",
    "Tempat tidur Saung Rumbia dari sudut lain",
    1086,
    1448,
  ),
  img(
    "cikidang-cabin-tempat-tidur-03",
    "/img/cikidang/cabin/tempat-tidur-03.webp",
    "Dua tempat tidur untuk dua orang di Saung Rumbia",
    1086,
    1448,
  ),
  img(
    "cikidang-cabin-tempat-tidur-04",
    "/img/cikidang/cabin/tempat-tidur-04.webp",
    "Detail tempat tidur Saung Rumbia",
    970,
    1448,
  ),
  img(
    "cikidang-denah",
    "/img/cikidang/denah.webp",
    "Denah area CampX Cikidang: gerbang, parkir, paintball, flying fox, Taman Batu, aula, cabin, dua campground, dan titik rafting",
    2000,
    1442,
  ),
];

export const VIDEOS: VideoRef[] = [
  {
    id: "jatiluhur-hero",
    src: "/video/hero-video.mp4",
    poster: "/video/hero-video-poster.jpg",
    alt: "Suasana camping di tepi Waduk Jatiluhur",
    width: 720,
    height: 1280,
  },
  {
    id: "cikidang-drone",
    src: "/video/cikidang-drone.mp4",
    poster: "/video/cikidang-drone-poster.jpg",
    alt: "Rekaman drone area CampX Cikidang dari atas Sungai Citarik",
    width: 1280,
    height: 720,
  },
];

const BY_ID = new Map(MEDIA.map((asset) => [asset.id, asset]));
const VIDEO_BY_ID = new Map(VIDEOS.map((video) => [video.id, video]));

/**
 * Throws on an unknown id rather than returning null.
 *
 * A missing image is always an authoring mistake, and failing at module load
 * names the id. Returning null would ship a silently empty frame instead.
 */
export function media(id: string): MediaAsset {
  const asset = BY_ID.get(id);
  if (!asset) {
    throw new Error(`[campx/data] Unknown media id "${id}".`);
  }
  return asset;
}

export function mediaList(ids: string[]): MediaAsset[] {
  return ids.map(media);
}

export function optionalMedia(id: string | null): MediaAsset | null {
  return id === null ? null : media(id);
}

export function video(id: string): VideoRef {
  const asset = VIDEO_BY_ID.get(id);
  if (!asset) {
    throw new Error(`[campx/data] Unknown video id "${id}".`);
  }
  return asset;
}

export function optionalVideo(id: string | null): VideoRef | null {
  return id === null ? null : video(id);
}

// Duplicate ids would make `media()` silently return whichever came first.
const seen = new Set<string>();
for (const asset of [...MEDIA, ...VIDEOS]) {
  if (seen.has(asset.id)) {
    throw new Error(`[campx/data] Duplicate media id "${asset.id}".`);
  }
  seen.add(asset.id);
}
