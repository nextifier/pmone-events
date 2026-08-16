import { media, mediaList, optionalMedia, optionalVideo } from "./media";
import { CIKIDANG_OTA_LINKS, JATILUHUR_OTA_LINKS } from "./ota";
import type { Location, LocationInput, LocationSlug } from "./types";

/**
 * The two CampX branches.
 *
 * Cikidang opened 1 Aug 2026 and several of its operational details are not
 * published anywhere yet: street address, coordinates, check-in hours, entrance
 * fee and capacity. Those fields are `null` on purpose. Every section that
 * depends on them hides itself, which is the honest behaviour — a guessed
 * address or a fabricated map pin sends real people to the wrong place.
 *
 * Fill them in as they are confirmed; no component change is needed.
 */

const ONLINE_BOOKING_NOTE = "Booking langsung di web lagi kami siapkan.";

const LOCATION_INPUTS: LocationInput[] = [
  {
    id: "campx-jatiluhur",
    slug: "jatiluhur",
    name: "CampX Jatiluhur",
    shortName: "Jatiluhur",
    tagline: "Camping di tepi waduk terbesar di Indonesia",
    status: "open",
    openedAt: null,
    order: 10,

    address: {
      line1: "Jl. Waduk Jatiluhur",
      village: "Jatimekar",
      district: "Kecamatan Jatiluhur",
      regency: "Kabupaten Purwakarta",
      province: "Jawa Barat",
      postalCode: "41152",
      country: "ID",
    },
    geo: { lat: -6.52797976381809, lng: 107.39153497499031 },
    googleMapsUrl: "https://maps.app.goo.gl/YsxHzezAu8Vpnrvx5",
    googleMapsEmbedSrc: null,
    landscape: "lakeside",
    distanceFromJakarta: { hours: 2, label: "±2 jam dari Jakarta" },

    description:
      "Camping ground di tepi Waduk Jatiluhur, Purwakarta. Kavling menghadap air, dua jam dari Jakarta lewat Tol Cipularang.",

    story: `
      <p>CampX Jatiluhur berdiri persis di tepi Waduk Jatiluhur, waduk terbesar di Indonesia, sekitar dua jam berkendara dari Jakarta lewat Tol Cipularang. Yang membedakannya dari camping ground lain di Purwakarta itu jarak ke airnya. Kavlingnya menghadap danau langsung, jadi begitu buka tenda pagi-pagi yang kelihatan air dan perbukitan di seberang, bukan tenda tetangga.</p>
      <p>Ada tiga cara menginap di sini, dan bedanya cuma seberapa banyak barang yang mau kamu bawa. Sudah punya tenda dan gear sendiri? Sewa kavlingnya saja, listrik dan air bersih sudah tersedia di titiknya. Belum punya, atau malas pasang? Tendanya kami siapkan lengkap dengan matras dan lampu, kamu tinggal datang. Mau yang lebih nyaman lagi, ada Cabin X, bangunan tertutup dengan kasur dan pemandangan danau dari depan pintu.</p>
      <p>Siang harinya danau ini yang jadi tempat mainnya. Stand-up paddle board, sepeda, dan spot mancing bebas dipakai tamu yang menginap. Kalau mau yang lebih kencang ada jetski dan jetcar. Kalau mau santai, sewa perahu untuk keliling waduk sambil melihat keramba apung dan perbukitan dari dekat.</p>
      <p>Buat rombongan kantor, Tebing Boyer di seberang danau jadi alasan banyak tim datang ke sini. Perjalanannya naik perahu, lanjut hiking, lalu ditutup fun games yang dipandu fasilitator. Bisa selesai dalam sehari, bisa juga dilanjut menginap dengan api unggun.</p>
      <p>Belum siap menginap tapi penasaran? Day Trip Pass membuka seluruh area seharian, termasuk main SUP dan sepeda. Banyak tamu memakai ini untuk kenalan dulu sebelum membawa keluarganya menginap.</p>
      <p>Fasilitas dasarnya lengkap: toilet, kamar mandi, musholla, dapur bersama, area api unggun, dan parkir luas. WiFi menjangkau area kavling, jadi kerja jarak jauh dari tepi danau bukan hal aneh di sini. Check-in mulai pukul 14.00 dan check-out pukul 12.00, sementara jam tenang berlaku mulai pukul 22.00 supaya yang mau tidur cepat tetap bisa tidur.</p>
    `,

    highlights: [
      "Kavling menghadap Waduk Jatiluhur langsung",
      "Dua jam dari Jakarta lewat Tol Cipularang",
      "SUP, sepeda, dan mancing gratis untuk tamu menginap",
      "Tebing Boyer untuk outing dan team building",
    ],

    facilitySlugs: [
      "toilet",
      "kamar-mandi",
      "air-bersih",
      "listrik",
      "parkir",
      "musholla",
      "wifi",
      "api-unggun",
      "dapur-bersama",
      "cafe",
      "warung",
      "spot-foto",
      "dermaga",
      "danau",
      "aula",
      "meeting-room",
      "open-stage",
      "welcome-area",
      "team-building-area",
      "sound-system",
      "dokumentasi",
    ],

    zones: [],

    routes: [
      {
        from: "Jakarta",
        distanceKm: 100,
        durationMinutes: 120,
        via: "Tol Cipularang, keluar Jatiluhur",
        note: null,
      },
      {
        from: "Bandung",
        distanceKm: 70,
        durationMinutes: 90,
        via: "Tol Purbaleunyi, keluar Sadang",
        note: null,
      },
    ],

    hours: {
      checkIn: "14.00",
      checkOut: "12.00",
      dayTripOpen: "07.00",
      dayTripClose: "19.00",
      quietHours: "22.00",
    },

    entranceFee: null,

    // From "Compro CampX Holiday Park Venue Guide.pdf" (Nov 2025), the deck
    // CampX sends to corporate enquiries.
    capacity: {
      campsite: 112,
      campsiteSize: "5 x 5 m",
      cabin: 13,
      cabinSize: "2,5 x 3 m",
      camperVan: 50,
      camperVanSize: "6 x 9 m",
      amphitheatre: 200,
      note: "Listrik dan air bersih tanpa batas, toilet terpisah pria dan wanita, musholla 3 x 3 m.",
    },

    heroMediaId: "jatiluhur-cabin-03",

    galleryIds: [
      "jatiluhur-tenda-01",
      "jatiluhur-kavling-01",
      "jatiluhur-cabin-01",
      "jatiluhur-cabin-05",
      "jatiluhur-tenda-malam-01",
      "jatiluhur-cabin-14",
      "jatiluhur-cabin-17",
      "jatiluhur-tenda-02",
    ],

    siteMapImageId: null,

    videoId: "jatiluhur-hero",

    files: [
      {
        label: "Denah CampX Jatiluhur",
        href: "/files/denah-campx.pdf",
        icon: "hugeicons:maps",
      },
      {
        label: "Harga sewa peralatan",
        href: "/files/pricelist-sewa-peralatan-campx.pdf",
        icon: "hugeicons:pdf-01",
      },
    ],

    bookingChannels: {
      whatsapp: {
        enabled: true,
        label: null,
        template: "Halo CampX {location}! Saya mau tanya paket {package}.",
      },
      ota: JATILUHUR_OTA_LINKS,
      onlineBooking: { enabled: false, note: ONLINE_BOOKING_NOTE },
    },

    nearby: [
      {
        name: "Waduk Jatiluhur",
        distanceKm: 0,
        description: "Waduk terbesar di Indonesia, dan halaman depan kami.",
      },
      {
        name: "Jatiluhur Water World",
        distanceKm: 0.3,
        description: "Taman air keluarga, jalan kaki dari area CampX.",
      },
      {
        name: "Tebing Boyer",
        distanceKm: null,
        description: "Tebing di seberang danau, dicapai naik perahu lalu hiking.",
      },
      {
        name: "Gunung Parang",
        distanceKm: null,
        description: "Tebing andesit setinggi 900 meter, terkenal untuk via ferrata.",
      },
    ],

    seo: {
      title: "Camping & Glamping di Tepi Waduk Jatiluhur",
      description:
        "Camping, cabin, dan aktivitas air di tepi Waduk Jatiluhur, Purwakarta. Dua jam dari Jakarta. Mulai Rp100rb per orang.",
      keywords: [
        "camping jatiluhur",
        "glamping jatiluhur",
        "camping purwakarta",
        "wisata waduk jatiluhur",
        "tempat camping dekat jakarta",
        "camping tepi danau",
      ],
      ogImage: null,
      noindex: false,
    },
  },

  {
    id: "campx-cikidang",
    slug: "cikidang",
    name: "CampX Cikidang",
    shortName: "Cikidang",
    tagline: "Rafting Citarik dan camping di tepi sungai",
    status: "open",
    openedAt: "2026-08-01",
    order: 20,

    address: {
      line1: "Jl. Alternatif Cikidang - Pelabuhan Ratu RT. 5 RW. 3",
      village: "Kampung Lebak Wangi, Cijambe, Cikiray",
      district: "Kecamatan Cikidang",
      regency: "Kabupaten Sukabumi",
      province: "Jawa Barat",
      postalCode: "43367",
      country: "ID",
    },
    geo: { lat: -6.9161388, lng: 106.609775 },
    googleMapsUrl: "https://maps.app.goo.gl/VsFtPQCmUE3gVeLv9",
    googleMapsEmbedSrc: null,
    landscape: "riverside",
    distanceFromJakarta: { hours: 4, label: "±3-4 jam dari Jakarta" },

    description:
      "Camping ground dan operator arung jeram di tepi Sungai Citarik, Cikidang, Sukabumi. Lima jalur rafting, cabin A-frame, dan campground yang menempel ke sungai.",

    story: `
      <p>CampX Cikidang buka pada Agustus 2026 dan langsung menggeser arti camping buat kami. Kalau Jatiluhur soal danau yang tenang, Cikidang soal <strong>Sungai Citarik</strong> yang lewat persis di samping campground. Ini sungai arung jeram paling terkenal di Jawa Barat, dan area kami ada di Kecamatan Cikidang, Kabupaten Sukabumi, di jalur alternatif menuju Pelabuhan Ratu.</p>
      <p>Rafting Citarik jadi menu utamanya. Ada lima jalur, dari Salamander sepanjang 5 kilometer sekitar satu jam untuk yang baru pertama kali, sampai Grand Crocodile 17 kilometer yang memakan waktu lima jam. Anak umur lima tahun pun punya jalurnya sendiri lewat paket Baby Salamander. Semua paket sudah termasuk perlengkapan, pemandu, tim rescue, asuransi, dan transportasi lokal ke titik start.</p>
      <p>Di darat pilihannya juga banyak. Flying fox melintas di atas sungai, ATV keliling jalur tanah, trekking 13 kilometer menembus kebun dan kampung, dan paintball di lapangan khusus dengan perlengkapan lengkap. Aktivitas darat ini yang biasanya diambil rombongan kantor, karena minimal pesertanya kecil dan bisa dirangkai jadi satu hari penuh.</p>
      <p>Untuk menginap ada dua pilihan. Saung Rumbia, cabin A-frame beratap rumbia dengan deck kayu di depannya, muat dua orang dan sudah termasuk tempat tidur, kipas, listrik, air, serta set meja kursi. Atau tentsite di dua area campground: Middle Point yang datar dan teduh, dan Riverside yang menempel ke sungai. Suara airnya terdengar semalaman di Riverside, dan itu alasan orang memilihnya.</p>
      <p>Punya waktu satu hari penuh dan mau keluar area? Ada trip ke Geopark Ciletuh. Berangkat setengah delapan pagi, mampir ke Pelabuhan Ratu, dua curug, lalu Pantai Palangpang atau Puncak Aher, dan kembali sore hari.</p>
      <p>Fasilitas dasarnya sudah jadi: lobby dan resepsionis, aula bambu terbuka untuk berkumpul, kamar mandi dan shower air bersih, toilet, wastafel, listrik, WiFi, dan parkir. Ada juga jembatan gantung menyeberang sungai dan Taman Batu yang biasanya jadi rebutan untuk foto.</p>
    `,

    highlights: [
      "Lima jalur rafting Citarik, dari 5 sampai 17 kilometer",
      "Campground Riverside menempel ke Sungai Citarik",
      "Cabin A-frame Saung Rumbia beratap rumbia",
      "Aula bambu terbuka untuk rombongan",
    ],

    facilitySlugs: [
      "toilet",
      "kamar-mandi",
      "shower",
      "air-bersih",
      "listrik",
      "parkir",
      "wifi",
      "kasur",
      "meja-kursi",
      "resepsionis",
      "support-24-jam",
      "aula",
      "spot-foto",
      "jembatan-gantung",
      "sungai",
    ],

    zones: [
      {
        slug: "entrance-gate",
        name: "Entrance Gate",
        description: "Pintu masuk utama menuju area CampX Cikidang.",
        icon: "hugeicons:entrance-stairs",
        mediaId: null,
        order: 10,
      },
      {
        slug: "parking-area",
        name: "Parking Area",
        description: "Parkir mobil dan motor tepat setelah gerbang.",
        icon: "hugeicons:car-parking-01",
        mediaId: "cikidang-parkir",
        order: 20,
      },
      {
        slug: "paintball-spot",
        name: "Paintball Spot",
        description: "Lapangan paintball dengan rintangan, untuk rombongan minimal 10 orang.",
        icon: "hugeicons:target-01",
        mediaId: null,
        order: 30,
      },
      {
        slug: "flying-fox-spot",
        name: "Flying Fox Spot",
        description: "Titik luncur flying fox yang melintas di atas sungai.",
        icon: "hugeicons:flying-human",
        mediaId: null,
        order: 40,
      },
      {
        slug: "taman-batu",
        name: "Taman Batu",
        description: "Hamparan bebatuan besar yang jadi spot foto paling ramai di area ini.",
        icon: "hugeicons:image-01",
        mediaId: "cikidang-taman-batu",
        order: 50,
      },
      {
        slug: "lobby-aula",
        name: "Lobby Receptionist & Aula",
        description:
          "Tempat check-in sekaligus aula bambu terbuka dengan meja kursi, dipakai untuk briefing, makan bersama, dan sesi rombongan.",
        icon: "hugeicons:conference",
        mediaId: "cikidang-aula-01",
        order: 60,
      },
      {
        slug: "cabin-area",
        name: "Cabin Area",
        description: "Deretan Saung Rumbia, cabin A-frame dengan deck kayu di depannya.",
        icon: "hugeicons:home-05",
        mediaId: "cikidang-saung-rumbia",
        order: 70,
      },
      {
        slug: "campground-middle-point",
        name: "Campground Middle Point",
        description: "Area camping di tengah, tanahnya datar dan banyak pohon peneduh.",
        icon: "hugeicons:tent",
        mediaId: "cikidang-lapang-riung-01",
        order: 80,
      },
      {
        slug: "campground-riverside",
        name: "Campground Riverside",
        description: "Area camping paling dekat sungai. Suara air terdengar semalaman.",
        icon: "hugeicons:kayak",
        mediaId: "cikidang-riverside-01",
        order: 90,
      },
      {
        slug: "rafting-spot",
        name: "Rafting Spot",
        description: "Titik start dan finish arung jeram, di sisi hulu area campground.",
        icon: "hugeicons:kayak",
        mediaId: null,
        order: 100,
      },
    ],

    routes: [
      {
        from: "Jakarta",
        distanceKm: null,
        durationMinutes: 210,
        via: "Tol Bocimi, lanjut arah Cikidang",
        note: "Perkiraan, bisa lebih lama di akhir pekan panjang.",
      },
      {
        from: "Bogor",
        distanceKm: null,
        durationMinutes: 150,
        via: "Jalur Cibadak lalu Cikidang",
        note: "Perkiraan.",
      },
      {
        from: "Bandung",
        distanceKm: null,
        durationMinutes: 240,
        via: "Tol Bocimi lewat Sukabumi kota",
        note: "Perkiraan.",
      },
    ],

    hours: null,
    entranceFee: null,
    capacity: null,

    heroMediaId: "cikidang-riverside-01",

    galleryIds: [
      "cikidang-jembatan-gantung",
      "cikidang-saung-rumbia",
      "cikidang-lapang-riung-01",
      "cikidang-riverside-02",
      "cikidang-taman-batu",
      "cikidang-aula-02",
      "cikidang-riverside-03",
      "cikidang-wastafel",
    ],

    siteMapImageId: "cikidang-denah",

    videoId: "cikidang-drone",

    files: [],

    bookingChannels: {
      whatsapp: {
        enabled: true,
        label: null,
        template: "Halo CampX {location}! Saya mau tanya paket {package}.",
      },
      ota: CIKIDANG_OTA_LINKS,
      onlineBooking: { enabled: false, note: ONLINE_BOOKING_NOTE },
    },

    nearby: [
      {
        name: "Geopark Ciletuh",
        distanceKm: null,
        description: "Kawasan geopark UNESCO dengan deretan curug dan tebing laut.",
      },
      {
        name: "Curug Cimarinjung",
        distanceKm: null,
        description: "Air terjun bertebing merah, salah satu ikon Ciletuh.",
      },
      {
        name: "Curug Sodong",
        distanceKm: null,
        description: "Air terjun kembar yang bisa dijangkau tanpa trekking panjang.",
      },
      {
        name: "Pantai Palangpang",
        distanceKm: null,
        description: "Pantai teluk di dalam kawasan Geopark Ciletuh.",
      },
      {
        name: "Pelabuhan Ratu",
        distanceKm: null,
        description: "Kota pantai di selatan Sukabumi, perhentian pertama trip Geopark.",
      },
    ],

    seo: {
      title: "Rafting Citarik & Camping di Cikidang, Sukabumi",
      description:
        "Lima jalur arung jeram Sungai Citarik, paintball, ATV, flying fox, cabin, dan campground tepi sungai di Cikidang, Sukabumi. Mulai Rp70rb per orang.",
      keywords: [
        "rafting citarik",
        "arung jeram citarik",
        "paket rafting citarik",
        "rafting sukabumi",
        "arung jeram sukabumi",
        "camping sukabumi",
        "camping cikidang",
        "paintball sukabumi",
        "atv sukabumi",
        "outbound sukabumi",
      ],
      ogImage: null,
      noindex: false,
    },
  },
];

/**
 * Swaps every media id for the asset it names.
 *
 * Runs once at module load, so an id typo throws while the config is being
 * read — the build stops with the bad id in the message instead of shipping a
 * page with a hole in it.
 */
function resolveLocation(input: LocationInput): Location {
  const { heroMediaId, galleryIds, siteMapImageId, videoId, zones, ...rest } = input;

  return {
    ...rest,
    heroMedia: media(heroMediaId),
    gallery: mediaList(galleryIds),
    siteMapImage: optionalMedia(siteMapImageId),
    video: optionalVideo(videoId),
    zones: zones.map(({ mediaId, ...zone }) => ({
      ...zone,
      media: optionalMedia(mediaId),
    })),
  };
}

export const LOCATIONS: Location[] = LOCATION_INPUTS.map(resolveLocation);

const BY_SLUG = new Map(LOCATIONS.map((location) => [location.slug, location]));

export const LOCATION_SLUGS: LocationSlug[] = LOCATIONS.map((location) => location.slug);

export function getLocation(slug: string): Location | null {
  return BY_SLUG.get(slug as LocationSlug) ?? null;
}

export function isLocationSlug(slug: string): slug is LocationSlug {
  return BY_SLUG.has(slug as LocationSlug);
}

/** Every branch except the one given. Powers the "ada juga di ..." cross-links. */
export function otherLocations(slug: LocationSlug): Location[] {
  return LOCATIONS.filter((location) => location.slug !== slug);
}

const NEWEST_OPENED_AT = LOCATIONS.map((location) => location.openedAt)
  .filter((date): date is string => Boolean(date))
  .sort()
  .at(-1);

/**
 * Whether a branch gets the "Baru" badge.
 *
 * Deliberately clock-free. The obvious version — "opened less than 90 days ago"
 * — reads `Date.now()` during render, so the prerendered HTML and the hydrating
 * client can disagree and Vue reports a hydration mismatch. That mismatch is
 * the single Best Practices audit Lighthouse actually fails on, and it has bit
 * this repo before.
 *
 * Instead: the branch with the most recent `openedAt` is the new one. Clear the
 * field when it stops being news.
 */
export function isNewLocation(location: Location): boolean {
  return Boolean(location.openedAt) && location.openedAt === NEWEST_OPENED_AT;
}
