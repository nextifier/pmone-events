import { defineStore } from "pinia";

export const useNewsCoveragesStore = defineStore("newsCoverages", {
  state: () => ({
    list: [
      {
        title: "FLEI 2025 Digelar, Waralaba Jadi Opsi di Tengah Lesunya Bisnis",
        link: "https://finance.detik.com/berita-ekonomi-bisnis/d-7972140/flei-2025-digelar-waralaba-jadi-opsi-di-tengah-lesunya-bisnis",
        created_at: "2025-06-19T10:00:00",
      },
      {
        title:
          "Minat Bisnis Waralaba yang Tinggi Bantu Genjot Pertumbuhan Ekonomi",
        link: "https://swa.co.id/read/460787/minat-bisnis-waralaba-yang-tinggi-bantu-genjot-pertumbuhan-ekonomi",
        created_at: "2025-06-19T10:00:00",
      },
      {
        title:
          "FLEI Business Show Edisi ke-25 Siap Digelar di NICE, PIK 2: Lokasi Strategis, Pasar Baru, dan Potensi Lebih Besar",
        link: "https://mediaindonesia.com/ekonomi/783825/flei-business-show-edisi-ke-25-siap-digelar-di-nice-pik-2---lokasi-strategis-pasar-baru-dan-potensi-lebih-besar-",
        created_at: "2025-06-19T10:00:00",
      },
      {
        title: "Franchise Jadi Jalan Pintas Anak Muda Menuju Dunia Usaha",
        link: "https://www.suara.com/bisnis/2025/06/20/073238/franchise-jadi-jalan-pintas-anak-muda-menuju-dunia-usaha",
        created_at: "2025-06-19T10:00:00",
      },
      {
        title: "Bisnis Waralaba Makin Diminati Generasi Muda, Ini Alasannya",
        link: "https://www.liputan6.com/bisnis/read/6056915/bisnis-waralaba-makin-diminati-generasi-muda-ini-alasannya",
        created_at: "2025-06-19T10:00:00",
      },
      // {
      //   title:
      //     "Ekonomi Lesu Datangkan Peluang Baru Bagi Bisnis Waralaba, Jangan Lupa Selektif Agar Tidak Boncos",
      //   slug: "ekonomi-lesu-datangkan-peluang-baru-bagi-bisnis-waralaba,-jangan-lupa-selektif-agar-tidak-boncos",
      //   link: "https://www.tribunnews.com/bisnis/2024/10/02/ekonomi-lesu-datangkan-peluang-baru-bagi-bisnis-waralaba-jangan-lupa-selektif-agar-tidak-boncos",
      //   isPublished: true,
      //   created_at: "2024-10-02T10:13:21",
      // },
      // {
      //   title:
      //     "Mau Jajal Bisnis Waralaba? Ada Pameran Franchise Digelar Bulan ini ",
      //   slug: "mau-jajal-bisnis-waralaba?-ada-pameran-franchise-digelar-bulan-ini-",
      //   link: "https://finance.detik.com/berita-ekonomi-bisnis/d-7568995/mau-jajal-bisnis-waralaba-ada-pameran-franchise-digelar-bulan-ini",
      //   isPublished: true,
      //   created_at: "2024-10-02T10:13:21",
      // },
      // {
      //   title:
      //     "Pameran Waralaba Digelar, Bantu Kejar Target Pertumbuhan Ekonomi 8 Persen",
      //   slug: "pameran-waralaba-digelar,-bantu-kejar-target-pertumbuhan-ekonomi-8-persen",
      //   link: "https://www.merdeka.com/uang/pameran-waralaba-digelar-bantu-kejar-target-pertumbuhan-ekonomi-8-persen-207895-mvk.html",
      //   isPublished: true,
      //   created_at: "2024-10-02T10:13:21",
      // },
      // {
      //   title:
      //     "Flei Business Show 2024: Platform Peluang Bisnis dan Waralaba Lokal Rasa Global",
      //   slug: "flei-business-show-2024:-platform-peluang-bisnis-dan-waralaba-lokal-rasa-global",
      //   link: "https://www.inilah.com/flei-business-show-2024-platform-peluang-bisnis-dan-waralaba-lokal-rasa-global",
      //   isPublished: true,
      //   created_at: "2024-10-02T10:13:21",
      // },
      // {
      //   title:
      //     "Mengoptimalkan Peluang Bisnis Waralaba di Saat Ekonomi Dibidik Tumbuh 8%",
      //   slug: "mengoptimalkan-peluang-bisnis-waralaba-di-saat-ekonomi-dibidik-tumbuh-8%",
      //   link: "https://peluangusaha.kontan.co.id/news/mengoptimalkan-peluang-bisnis-waralaba-di-saat-ekonomi-dibidik-tumbuh-8",
      //   isPublished: true,
      //   created_at: "2024-10-03T10:13:21",
      // },
      // {
      //   title:
      //     "FLEI Business Show 2024: A Platform for Business and Franchise Opportunities Amid the 8% Economic Growth Target",
      //   slug: "flei-business-show-2024:-a-platform-for-business-and-franchise-opportunities-amid-the-8%-economic-growth-target",
      //   link: "https://whatsnewindonesia.com/jakarta/feature/news/flei-business-show-2024-platform-business-and-franchise-opportunities-amid-8",
      //   isPublished: true,
      //   created_at: "2024-10-04T10:13:21",
      // },
      // {
      //   title:
      //     "Dorong Waralaba Jangkau Pasar Lebih Luas FLEI Business Show 2025 Ekspansi ke Surabaya!",
      //   link: "https://wartaekonomi.co.id/read560228/dorong-waralaba-jangkau-pasar-lebih-luas-flei-business-show-2025-ekspansi-ke-surabaya",
      //   isPublished: true,
      //   created_at: "2025-03-07T10:00:00",
      // },
      // {
      //   title:
      //     "Garap Pasar Potensial, Pameran Waralaba Jangkau Indonesia Timur",
      //   link: "https://mediaindonesia.com/ekonomi/749956/garap-pasar-potensial-pameran-waralaba-jangkau-indonesia-timur",
      //   isPublished: true,
      //   created_at: "2025-03-07T10:00:00",
      // },
      // {
      //   title: "Pameran Waralaba FLEI Business Show 2025 Ekspansi ke Surabaya",
      //   link: "https://swa.co.id/read/457316/pameran-waralaba-flei-business-show-2025-ekspansi-ke-surabaya",
      //   isPublished: true,
      //   created_at: "2025-03-08T10:00:00",
      // },
      // {
      //   title:
      //     "Kembangkan Sayap, FLEI Business Show 2025 akan Digelar di Surabaya untuk Jangkau Pasar Lebih Luas",
      //   link: "https://www.jawapos.com/surabaya-raya/015738833/kembangkan-sayap-flei-business-show-2025-akan-digelar-di-surabaya-untuk-jangkau-pasar-lebih-luas",
      //   isPublished: true,
      //   created_at: "2025-03-09T10:00:00",
      // },
      // {
      //   title:
      //     "FLEI Business Show 2025 Ekspansi Pasar Waralaba Indonesia Timur",
      //   link: "https://www.suara.com/bisnis/2025/03/09/112558/flei-business-show-2025-ekspansi-pasar-waralaba-indonesia-timur",
      //   isPublished: true,
      //   created_at: "2025-03-09T10:00:00",
      // },
      // {
      //   title:
      //     "Perluas Jangkauan Pasar Waralaba, FLEI Business Show 2025 Ekspansi ke Surabaya",
      //   link: "https://radarsurabayabisnis.jawapos.com/industri-perdagangan/2185740363/perluas-jangkauan-pasar-waralaba-flei-business-show-2025-ekspansi-ke-surabaya",
      //   isPublished: true,
      //   created_at: "2025-03-09T10:00:00",
      // },
      // {
      //   title: "FLEI Business Show 2025 digelar di Surabaya",
      //   link: "https://jatim.antaranews.com/berita/892145/flei-business-show-2025-digelar-di-surabaya",
      //   isPublished: true,
      //   created_at: "2025-03-09T10:00:00",
      // },
      // {
      //   title: "FLEI Business Show 2025 Hadir di Surabaya",
      //   link: "https://www.rri.co.id/bisnis/1375898/flei-business-show-2025-hadir-di-surabaya",
      //   isPublished: true,
      //   created_at: "2025-03-09T10:00:00",
      // },
      // {
      //   title:
      //     "FLEI Business Show 2025: Ekspansi ke Surabaya, Jangkau Pasar Indonesia Timur",
      //   link: "https://beritajatim.com/flei-business-show-2025-ekspansi-ke-surabaya-jangkau-pasar-indonesia-timur",
      //   isPublished: true,
      //   created_at: "2025-03-10T10:00:00",
      // },
      // {
      //   title: "",
      //   link: "",
      //   isPublished: true,
      //   created_at: "2025-03-07T10:00:00",
      // },
    ],
  }),

  // getters: {
  //   getPublishedNews: (state) => () => {
  //     return state.news.filter((item) => item.isPublished);
  //   },
  // },
});
