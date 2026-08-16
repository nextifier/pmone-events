import type { Faq } from "./types";

/**
 * FAQ, scoped three ways: by branch, by category, and by which page type may
 * render it.
 *
 * `showOnPages` also decides where `FAQPage` JSON-LD gets emitted. The same
 * question set marked up on the home page, a branch hub and a package page at
 * once is the kind of duplication Google filters, so only `/faq` and the branch
 * hubs emit it, and only for questions they own.
 *
 * Everything here is answerable from the price lists, the site map, or the
 * existing site. Where a policy is not documented anywhere, the answer says so
 * and points at WhatsApp instead of inventing one.
 */
export const FAQS: Faq[] = [
  {
    id: "cara-pesan",
    question: "Gimana cara pesannya?",
    answer: `
      <p>Paling cepat lewat WhatsApp. Klik tombol pesan di halaman paket yang kamu mau, pesannya sudah terisi otomatis dengan nama paket dan cabangnya, tinggal kirim.</p>
      <p>Khusus paket menginap di Jatiluhur, kamu juga bisa pesan lewat Agoda, Traveloka, tiket.com, atau Trip.com.</p>
    `,
    scope: { locationSlugs: [], categorySlugs: [] },
    showOnPages: ["home", "faq", "package"],
    order: 10,
  },
  {
    id: "bayar-di-tempat",
    question: "Bisa bayar di tempat?",
    answer: `
      <p>Reservasinya tetap harus dikonfirmasi dulu lewat WhatsApp, supaya kavling atau jadwal aktivitasmu tidak keburu diambil orang lain. Soal cara bayarnya, tim kami yang jelaskan waktu konfirmasi, karena bisa berbeda tergantung paket dan tanggalnya.</p>
    `,
    scope: { locationSlugs: [], categorySlugs: [] },
    showOnPages: ["faq"],
    order: 20,
  },
  {
    id: "beda-dua-cabang",
    question: "Apa bedanya Jatiluhur dan Cikidang?",
    answer: `
      <p>Jatiluhur di Purwakarta, di tepi Waduk Jatiluhur. Suasananya danau yang tenang, dan aktivitasnya di atas air: paddle board, perahu, memancing, jetski.</p>
      <p>Cikidang di Sukabumi, di tepi Sungai Citarik. Menu utamanya arung jeram, ditambah flying fox, ATV, trekking, dan paintball.</p>
      <p>Dua-duanya bisa untuk menginap dan untuk outing rombongan. Kalau timmu mau yang santai, ambil Jatiluhur. Kalau mau yang memacu adrenalin, Cikidang.</p>
    `,
    scope: { locationSlugs: [], categorySlugs: [] },
    showOnPages: ["home", "faq"],
    order: 30,
  },
  {
    id: "berapa-lama-dari-jakarta",
    question: "Berapa lama dari Jakarta?",
    answer: `
      <p>Jatiluhur sekitar dua jam lewat Tol Cipularang, keluar di gerbang Jatiluhur. Cikidang lebih jauh, tiga sampai empat jam lewat Tol Bocimi, dan bisa molor kalau kebetulan akhir pekan panjang.</p>
      <p>Dari Bandung, Jatiluhur cuma satu setengah jam. Dari Bogor, Cikidang sekitar dua setengah jam.</p>
    `,
    scope: { locationSlugs: [], categorySlugs: [] },
    showOnPages: ["home", "faq", "location"],
    order: 35,
  },
  {
    id: "lokasi-jatiluhur",
    question: "Di mana persisnya CampX Jatiluhur?",
    answer: `
      <p>Di <strong>Jl. Waduk Jatiluhur, Jatimekar, Kecamatan Jatiluhur, Kabupaten Purwakarta, Jawa Barat 41152</strong>. Sekitar dua jam dari Jakarta lewat Tol Cipularang, keluar di gerbang Jatiluhur.</p>
      <p>Kalau pakai peta, cari "CampX Jatiluhur" di Google Maps atau buka <a href="https://maps.app.goo.gl/YsxHzezAu8Vpnrvx5" target="_blank" rel="noopener">titik lokasinya di sini</a>.</p>
    `,
    scope: { locationSlugs: ["jatiluhur"], categorySlugs: [] },
    showOnPages: ["faq", "location"],
    order: 40,
  },
  {
    id: "lokasi-cikidang",
    question: "Di mana persisnya CampX Cikidang?",
    answer: `
      <p>Di <strong>Jl. Alternatif Cikidang - Pelabuhan Ratu RT. 5 RW. 3, Kampung Lebak Wangi, Cijambe, Cikiray, Kecamatan Cikidang, Kabupaten Sukabumi, Jawa Barat 43367</strong>, persis di tepi Sungai Citarik.</p>
      <p>Dari Jakarta kira-kira tiga sampai empat jam lewat Tol Bocimi, tergantung lalu lintas. Titik lokasinya bisa dibuka <a href="https://maps.app.goo.gl/VsFtPQCmUE3gVeLv9" target="_blank" rel="noopener">di Google Maps sini</a>.</p>
    `,
    scope: { locationSlugs: ["cikidang"], categorySlugs: [] },
    showOnPages: ["faq", "location"],
    order: 50,
  },
  {
    id: "datang-tanpa-menginap",
    question: "Bisa datang tanpa menginap?",
    answer: `
      <p>Bisa. Di Jatiluhur ada Day Trip Pass seharga Rp100.000 per orang untuk seharian penuh, pukul 07.00 sampai 19.00, sudah termasuk main paddle board dan sepedaan keliling area.</p>
      <p>Di Cikidang semua aktivitas dijual per sesi, jadi kamu bisa ambil rafting atau paintball saja lalu pulang sore.</p>
    `,
    scope: { locationSlugs: [], categorySlugs: [] },
    showOnPages: ["home", "faq"],
    order: 55,
  },
  {
    id: "jam-check-in-jatiluhur",
    question: "Jam berapa check-in dan check-out di Jatiluhur?",
    answer: `
      <p>Check-in mulai pukul 14.00 dan check-out pukul 12.00. Untuk Day Trip Pass, areanya buka pukul 07.00 sampai 19.00.</p>
      <p>Jam tenang berlaku mulai pukul 22.00, jadi musik dan obrolan dipelankan supaya tetangga kavling bisa tidur.</p>
    `,
    scope: { locationSlugs: ["jatiluhur"], categorySlugs: [] },
    showOnPages: ["faq", "location"],
    order: 60,
  },
  {
    id: "harga-weekday-weekend",
    question: "Harga weekday dan weekend beda?",
    answer: `
      <p>Beda, dan selisihnya lumayan. Weekday di sini hitungannya Senin sampai Kamis, weekend Jumat sampai Minggu.</p>
      <p>Contohnya Cabin X di Jatiluhur: Rp175.000 per orang di weekday, Rp225.000 di weekend. Aktivitas seperti rafting, paintball, dan ATV harganya sama sepanjang minggu.</p>
    `,
    scope: { locationSlugs: [], categorySlugs: [] },
    showOnPages: ["home", "faq", "package"],
    order: 65,
  },
  {
    id: "fasilitas-jatiluhur",
    question: "Fasilitas apa saja yang ada di Jatiluhur?",
    answer: `
      <p>Toilet, kamar mandi, musholla, dapur bersama, area api unggun, dan parkir. Listrik dan air bersih tersedia sampai ke kavling, dan WiFi menjangkau area camping.</p>
      <p>Tamu yang menginap bebas memakai stand-up paddle board, sepeda, dan spot memancing tanpa biaya tambahan.</p>
    `,
    scope: { locationSlugs: ["jatiluhur"], categorySlugs: [] },
    showOnPages: ["faq", "location"],
    order: 70,
  },
  {
    id: "listrik-air-kavling",
    question: "Ada listrik dan air bersih di kavling?",
    answer: `
      <p>Ada, di dua cabang. Listrik dan air bersih sampai ke titik kavling, jadi kamu tidak perlu bawa jerigen atau menghemat baterai semalaman.</p>
      <p>WiFi juga menjangkau area camping di Jatiluhur. Beberapa tamu memang sengaja kerja dari sana.</p>
    `,
    scope: { locationSlugs: [], categorySlugs: [] },
    showOnPages: ["home", "faq", "location"],
    order: 75,
  },
  {
    id: "fasilitas-cikidang",
    question: "Fasilitas apa saja yang ada di Cikidang?",
    answer: `
      <p>Lobby dan resepsionis, aula bambu terbuka untuk berkumpul, kamar mandi dan shower air bersih, toilet, wastafel bersama, listrik, WiFi, dan parkir.</p>
      <p>Areanya juga punya jembatan gantung menyeberang sungai dan Taman Batu yang biasanya jadi tempat foto paling ramai.</p>
    `,
    scope: { locationSlugs: ["cikidang"], categorySlugs: [] },
    showOnPages: ["faq", "location"],
    order: 80,
  },
  {
    id: "minimal-jumlah-orang",
    question: "Ada minimal jumlah orang?",
    answer: `
      <p>Tergantung paketnya. Paket menginap di Jatiluhur minimal dua orang. Aktivitas darat di Cikidang minimal lima orang, kecuali paintball yang minimal sepuluh.</p>
      <p>Paket outing minimal 20 peserta. Rafting dihitung per orang, satu perahu diisi empat, jadi kabari dulu rombonganmu berapa supaya kami siapkan perahunya.</p>
    `,
    scope: { locationSlugs: [], categorySlugs: [] },
    showOnPages: ["home", "faq", "package"],
    order: 85,
  },
  {
    id: "sewa-peralatan",
    question: "Bisa sewa peralatan camping di lokasi?",
    answer: `
      <p>Di Jatiluhur bisa. Daftar dan harganya ada di <a href="/files/pricelist-sewa-peralatan-campx.pdf" target="_blank" rel="noopener">PDF harga sewa peralatan</a>. Kalau tidak mau repot sama sekali, ambil saja paket Camping Tenda Lengkap, semuanya sudah terpasang di kavling.</p>
      <p>Untuk Cikidang, tanyakan dulu lewat WhatsApp ketersediaannya di tanggal yang kamu mau.</p>
    `,
    scope: { locationSlugs: [], categorySlugs: ["camping"] },
    showOnPages: ["faq", "package"],
    order: 90,
  },
  {
    id: "perlu-bawa-apa",
    question: "Perlu bawa apa kalau camping di sini?",
    answer: `
      <p>Tergantung paket yang kamu ambil. Kalau ambil Camping Tenda Lengkap atau cabin, tenda dan matras sudah kami pasang di kavling, jadi cukup bawa baju ganti dan perlengkapan mandi.</p>
      <p>Kalau ambil Camping Mandiri atau tentsite, tenda, perlengkapan tidur, dan alat masak bawa sendiri. Yang kami sediakan lahannya, listrik, dan air bersih.</p>
    `,
    scope: { locationSlugs: [], categorySlugs: ["camping"] },
    showOnPages: ["home", "faq", "package"],
    order: 95,
  },
  {
    id: "rafting-tidak-bisa-berenang",
    question: "Belum bisa berenang, boleh ikut rafting?",
    answer: `
      <p>Boleh. Pelampung dan helm wajib dipakai sepanjang perjalanan, tim rescue menyusuri sungai bersama rombongan, dan pemandu memberi briefing sebelum perahu turun.</p>
      <p>Kalau masih ragu, kabari waktu pesan. Kami arahkan ke jalur yang arusnya paling tenang.</p>
    `,
    scope: { locationSlugs: ["cikidang"], categorySlugs: ["rafting"] },
    showOnPages: ["faq", "package"],
    order: 100,
  },
  {
    id: "gratis-untuk-tamu-menginap",
    question: "Apa saja yang gratis untuk tamu yang menginap?",
    answer: `
      <p>Di Jatiluhur, stand-up paddle board, sepeda, dan spot mancing bebas dipakai tanpa biaya tambahan. Alat pancingnya saja yang bawa sendiri.</p>
      <p>Jetski, jetcar, dan sewa perahu tetap berbayar karena itu wahana terpisah.</p>
    `,
    scope: { locationSlugs: ["jatiluhur"], categorySlugs: [] },
    showOnPages: ["home", "faq", "location"],
    order: 105,
  },
  {
    id: "rafting-anak",
    question: "Anak umur berapa yang boleh ikut rafting?",
    answer: `
      <p>Ada jalur khusus anak usia 5 sampai 9 tahun namanya Baby Salamander, dengan pemandu, tim rescue, dan asuransi yang sama seperti paket dewasa.</p>
      <p>Untuk jalur dewasa, sebutkan usia peserta termuda waktu pesan supaya kami bisa sarankan jalur yang pas.</p>
    `,
    scope: { locationSlugs: ["cikidang"], categorySlugs: ["rafting"] },
    showOnPages: ["faq", "package"],
    order: 110,
  },
  {
    id: "bawa-apa-rafting",
    question: "Apa yang perlu dibawa untuk rafting?",
    answer: `
      <p>Baju ganti, alas kaki yang tidak masalah kalau basah, dan kantong plastik untuk baju basah. Sunblock juga membantu kalau jalurnya panjang.</p>
      <p>Barang berharga sebaiknya ditinggal, karena ponsel dan dompet tidak aman dibawa ke perahu.</p>
    `,
    scope: { locationSlugs: ["cikidang"], categorySlugs: ["rafting"] },
    showOnPages: ["faq", "package"],
    order: 120,
  },
  {
    id: "bawa-anak-kecil",
    question: "Aman buat anak kecil?",
    answer: `
      <p>Aman. Banyak keluarga datang bawa anak, terutama ke Jatiluhur yang medannya datar dan dekat ke toilet serta kamar mandi.</p>
      <p>Untuk rafting di Cikidang ada jalur khusus umur 5 sampai 9 tahun namanya Baby Salamander. Di bawah lima tahun belum bisa turun ke sungai, tapi tetap bisa ikut menginap dan main di area.</p>
    `,
    scope: { locationSlugs: [], categorySlugs: [] },
    showOnPages: ["home", "faq"],
    order: 125,
  },
  {
    id: "outing-kantor",
    question: "Bisa untuk outing kantor atau gathering?",
    answer: `
      <p>Bisa, di dua-duanya. Di Jatiluhur ada paket Boyer Hill Summit Challenge, sehari atau dua hari satu malam, minimal 20 peserta.</p>
      <p>Di Cikidang, rombongan biasanya merangkai rafting dengan paintball, flying fox, dan ATV jadi satu hari penuh, lalu berkumpul di aula.</p>
      <p>Susunan acaranya bisa disesuaikan. Cerita saja jumlah peserta, tanggal, dan tujuan acaranya, nanti kami buatkan penawarannya.</p>
    `,
    scope: { locationSlugs: [], categorySlugs: [] },
    showOnPages: ["faq", "outing"],
    order: 130,
  },
  {
    id: "kapasitas-rombongan",
    question: "Rombongan besar muat berapa orang?",
    answer: `
      <p>Kapasitasnya berbeda antara akhir pekan dan hari biasa, dan tergantung kombinasi tenda, cabin, dan aktivitas yang diambil.</p>
      <p>Kabari jumlah peserta dan tanggalnya lewat WhatsApp, nanti kami cek ketersediaannya dan kirim susunan yang paling masuk.</p>
    `,
    scope: { locationSlugs: [], categorySlugs: [] },
    showOnPages: ["faq", "outing"],
    order: 140,
  },
];

/** Questions a given page type may render, optionally narrowed to one branch. */
export function faqsFor(
  page: Faq["showOnPages"][number],
  options: { locationSlug?: string; categorySlug?: string; limit?: number } = {},
): Faq[] {
  const { locationSlug, categorySlug, limit } = options;

  const matches = FAQS.filter((faq) => {
    if (!faq.showOnPages.includes(page)) return false;

    const locationOk =
      !locationSlug ||
      faq.scope.locationSlugs.length === 0 ||
      faq.scope.locationSlugs.includes(locationSlug as never);

    const categoryOk =
      !categorySlug ||
      faq.scope.categorySlugs.length === 0 ||
      faq.scope.categorySlugs.includes(categorySlug);

    return locationOk && categoryOk;
  }).sort((a, b) => a.order - b.order);

  return limit ? matches.slice(0, limit) : matches;
}
