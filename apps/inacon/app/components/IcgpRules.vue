<template>
  <section id="icgp-rules" class="container">
    <div class="flex flex-col items-center text-center">
      <h2 class="section-title">{{ $t("icgp.rulesTitle") }}</h2>
      <p class="section-description mx-auto mt-3">
        {{ $t("icgp.rulesDescription") }}
      </p>
    </div>

    <div class="mx-auto mt-6 w-full max-w-screen-md lg:mt-10">
      <Accordion type="single" collapsible>
        <AccordionItem
          v-for="(item, i) in rules"
          :key="i"
          :value="`rule-${i}`"
        >
          <AccordionTrigger>
            <span
              class="text-lg font-medium tracking-tighter text-balance sm:text-xl"
              >{{ item.title }}</span
            >
          </AccordionTrigger>
          <AccordionContent>
            <ul class="flex list-disc flex-col gap-y-2 pl-5">
              <li
                v-for="(point, j) in item.points"
                :key="j"
                class="tracking-tight"
              >
                {{ point }}
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div class="mt-6 flex justify-center">
        <Button to="https://pmone.id/icgp-rules2027" variant="outline">
          <Icon name="hugeicons:download-01" class="size-4 shrink-0" />
          {{ $t("icgp.downloadRules") }}
        </Button>
      </div>
    </div>
  </section>
</template>

<script setup>
// Aturan resmi ICGP (Bahasa Indonesia). Sumber: pmone.id/icgp-rules2027 (PDF).
const rules = [
  {
    title: "A. Komposisi Tim",
    points: [
      "Tim terdiri dari 2 orang Warga Negara Indonesia, minimal berusia 18 tahun.",
      "Kostum wajib dibuat oleh kedua peserta, bukan salah satu peserta saja atau dibuatkan orang lain.",
    ],
  },
  {
    title: "B. Karakter yang Diperbolehkan",
    points: [
      "Kedua peserta mengenakan kostum dari satu seri yang sama, berasal dari manga, anime, video game, atau tokusatsu Jepang.",
      "Karakter dari dojinshi (fanzine) atau adaptasi karya yang bukan asli Jepang tidak diperbolehkan.",
      "Untuk kostum video game, karakter harus asli buatan Jepang. Karakter dari Disney, Star Wars, atau Marvel Anime tidak diizinkan meski game-nya dibuat di Jepang.",
      "Kostum dari adaptasi panggung atau live-action boleh jadi referensi, tapi penilaian tetap fokus pada karya aslinya.",
    ],
  },
  {
    title: "C. Kriteria Penilaian Kostum",
    points: [
      "Poin diberikan berdasarkan produksi elemen yang mengekspresikan karakter (kostum, aksesoris, makeup, dan lainnya). Gender atau ukuran peserta tidak memengaruhi penilaian.",
      "Semua item yang dinilai harus dibuat sendiri oleh kedua peserta, minimal 75 persen dibuat tangan. Sisanya mencakup bahan jadi (base wig, base sepatu, base aksesoris) dan alat otomatis (mesin 3D, laser cutting, mesin bordir, printing kain). Item yang kurang dari 75 persen buatan tangan tidak dinilai.",
      "Bantuan dari pihak lain maksimal 5 persen (perakitan, pemotongan, atau bantuan minor). Pembuatan armor, kostum kain, props tangan, props panggung, dan styling wig wajib dikerjakan peserta sendiri, dan bantuan harus dijelaskan dalam laporan.",
      "Barang komersial yang dibeli dan digunakan tidak dinilai.",
      "Perubahan detail dari karya asli, termasuk tambahan untuk gimmick, harus dijelaskan dalam laporan kostum.",
      "Berat total kostum dan props tidak boleh melebihi 40 kg. Pengurangan poin: 40,1 sampai 41,0 kg dikurangi 5 poin, dan 41,1 sampai 42,0 kg dikurangi 10 poin.",
    ],
  },
  {
    title: "D. 3D Printing",
    points: [
      "Penggunaan alat otomatis seperti printer 3D atau printer kain (screen printing) diperbolehkan.",
      "Langkah dan proses pengolahan hasil cetakan printer 3D akan dinilai. Peserta menjelaskan prosesnya dalam portofolio atau presentasi keterampilan.",
      "Membeli 3D model diperbolehkan dengan mencantumkan pencipta model. Hasil yang minimal 50 persen prosesnya dikerjakan peserta akan dipertimbangkan. Cetakan 3D tanpa proses tambahan yang signifikan tidak dinilai.",
      "Peserta harus menunjukkan bukti pembuatan 3D model buatan sendiri. Jika terbukti membeli file cetakan dan tidak mengakuinya, item tersebut tidak dinilai.",
    ],
  },
  {
    title: "E. Kriteria Penilaian Performance",
    points: [
      "Props panggung: maksimal 3 props, berat maksimal 10 kg per props, dimensi maksimal 2,1 m x 2,1 m x 0,9 m. Props di atas 10 kg tidak diizinkan naik panggung, dan kelebihan ukuran dikurangi 1 poin per sentimeter.",
      "Persiapan panggung: peletakan dan setup properti saat pergantian panggung maksimal 40 detik. Durasi penampilan maksimal 2 menit 30 detik.",
      "Senjata tiruan dari toko dilarang. Panitia bisa melarang item yang dianggap berbahaya.",
      "Penggunaan ilustrasi atau logo resmi karya pihak lain dilarang dalam penampilan.",
      "Audio dan Background Video (BGV) tidak dinilai secara langsung, tapi berkontribusi pada kualitas estetika penampilan. Semua aset (sound effect, dubbing, musik, visual effect, green-screen, stok foto atau video) harus bebas hak cipta atau dibuat peserta. BGV memakai rasio 16:9, resolusi 1920x1080, format mp4, durasi maksimal 2 menit 30 detik.",
      "Subtitle disarankan untuk dialog. Namun di tahap WCS, video harus diserahkan tanpa subtitle.",
      "Efek khusus: bermain di area penonton atau di luar panggung dilarang. Bahan seperti bubuk, konfeti logam, api, air, dan konfeti kertas kecil dilarang. Konsultasikan efek khusus, termasuk lampu laser, dengan panitia.",
    ],
  },
  {
    title: "F. Struktur Skor (Total 200 poin)",
    points: [
      "Penilaian Kostum (100 poin): Kualitas Kostum 40, Keakuratan 20, Kreativitas 20, Teknik 20.",
      "Penilaian Performance (100 poin): Penampilan 50, Akting dan Keahlian Panggung 20, Dampak Kostum di Panggung 20, Faktur WOW 10.",
    ],
  },
];
</script>
