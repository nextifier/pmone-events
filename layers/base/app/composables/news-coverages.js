import { defineStore } from 'pinia'

export const useNewsCoveragesStore = defineStore("newsCoverages", {
  state: () => ({
    list: [
      {
        title: "Megabuild Indonesia 2026 diselenggarakan pada 4 Juni di PIK 2",
        link: "https://www.antaranews.com/berita/5304004/megabuild-indonesia-2026-diselenggarakan-pada-4-juni-di-pik-2?utm_source=antaranews&utm_medium=mobile&utm_campaign=latest_category",
        created_at: "2025-12-14T10:00:00",
      },
      {
        title:
          "Megabuild Indonesia 2026 Dorong Akselerasi Pertumbuhan Industri Bahan Bangunan",
        link: "https://www.republika.co.id/berita/t78j9c456/megabuild-indonesia-2026-dorong-akselerasi-pertumbuhan-industri-bahan-bangunan",
        created_at: "2025-12-14T10:00:00",
      },
      {
        title:
          "Pameran Konstruksi dan Arsitektur Berskala Internasional Siap Digelar, Catat Tanggalnya",
        link: "https://www.liputan6.com/bisnis/read/6235241/pameran-konstruksi-dan-arsitektur-berskala-internasional-siap-digelar-catat-tanggalnya",
        created_at: "2025-12-12T10:00:00",
      },
      {
        title:
          "Megabuild Indonesia 2026 Target Dorong Percepatan Pertumbuhan Rantai Industri Bahan Bangunan",
        link: "https://www.merdeka.com/peristiwa/megabuild-indonesia-2026-target-dorong-percepatan-pertumbuhan-rantai-industri-bahan-bangunan-506624-mvk.html",
        created_at: "2025-11-27T10:00:00",
      },
      {
        title:
          "Raksasa Industri Bangunan Turun Gunung! MEGABUILD 2026 Jadi Pusat Pertarungan Brand Besar",
        link: "https://akuratnews.co/raksasa-industri-bangunan-turun-gunung-megabuild-2026-jadi-pusat-pertarungan-brand-besar/",
        created_at: "2025-12-11T10:00:00",
      },
      {
        title: "2026年6月印尼雅加达建筑建材展览会 将在雅加达NICE PIK 2举行",
        link: "https://huanqiuribao.com/?p=18942",
        created_at: "2025-12-14T10:00:00",
      },
      {
        title:
          "MEGABUILD Indonesia 2026 Jadi Katalis Utama Percepatan Industri Bahan Bangunan dan Desain",
        link: "https://ekbis.sindonews.com/read/1654463/34/megabuild-indonesia-2026-jadi-katalis-utama-percepatan-industri-bahan-bangunan-dan-desain-1765440768",
        created_at: "2025-12-10T10:00:00",
      },
      {
        title:
          "Megabuild Indonesia 2026 Siap Digelar: Dua Kali Lebih Besar, Sinergi Bahan Bangunan dan Keramika Indonesia",
        link: "https://propertiterkini.com/megabuild-indonesia-2026-siap-digelar-dua-kali-lebih-besar-sinergi-bahan-bangunan-dan-keramika-indonesia/",
        created_at: "2025-12-10T10:00:00",
      },
      {
        title:
          "MEGABUILD Indonesia 2026 Hadir dengan Skala Dua Kali Lebih Besar, Dorong Pertumbuhan Industri Bahan Bangunan",
        link: "https://wartaekonomi.co.id/read593190/megabuild-indonesia-2026-hadir-dengan-skala-dua-kali-lebih-besar-dorong-pertumbuhan-industri-bahan-bangunan",
        created_at: "2025-12-10T10:00:00",
      },
      {
        title: "Megabuild Digelar di NICE PIK2 (PANI CBDK)",
        link: "https://investor.id/business/421019/megabuild-digelar-di-nice-pik2-pani-cbdk",
        created_at: "2025-12-10T10:00:00",
      },
      // {
      //   title:
      //     "Megabuild Indonesia 2025 Kembali Hadir dengan Rebranding dan Fokus pada Inovasi Keberlanjutan",
      //   link: "https://bisnisreview.com/megabuild-indonesia-2025-kembali-hadir-dengan-rebranding-dan-fokus-pada-inovasi-keberlanjutan/",
      //   isPublished: true,
      //   created_at: "2024-10-16T10:00:00",
      // },
      // {
      //   title: "Pameran Megabuild akan di gelar 2 kali tahun depan ",
      //   link: "https://industri.kontan.co.id/news/pameran-megabuild-akan-digelar-2-kali-tahun-depan",
      //   isPublished: true,
      //   created_at: "2024-10-17T10:00:00",
      // },
      // {
      //   title:
      //     "Megabuild 2025, Hadir dengan rebranding dan fokus pada inovasi berkelanjutan",
      //   link: "https://www.jawapos.com/properti/015206646/megabuild-2025-hadir-dengan-rebranding-dan-fokus-pada-inovasi-keberlanjutan",
      //   isPublished: true,
      //   created_at: "2024-10-17T10:00:00",
      // },
      // {
      //   title:
      //     "Pameran material bangunan hingga konstruksi ramah lingkungan bakal di gelar ",
      //   link: "https://www.medcom.id/properti/news-properti/MkMOM6vN-pameran-material-bangunan-hingga-konstruksi-ramah-lingkungan-bakal-digelar",
      //   isPublished: true,
      //   created_at: "2024-10-17T10:00:00",
      // },
      // {
      //   title: "Ajang Mendorong perkembangan dunia infrastruktur Indonesia ",
      //   link: "https://ekbis.sindonews.com/read/1474133/34/ajang-mendorong-perkembangan-dunia-infrastruktur-indonesia-1729138243",
      //   isPublished: true,
      //   created_at: "2024-10-17T10:00:00",
      // },
      // {
      //   title:
      //     "Pacu Pertumbuhan Ekonomi, HDII dan IAI Dorong Geliat Sektor Konstruksi Tanah Air",
      //   link: "https://tribunnews.com/properti/2024/10/17/pacu-pertumbuhan-ekonomi-hdii-dan-iai-dorong-geliat-sektor-konstruksi-tanah-air",
      //   isPublished: true,
      //   created_at: "2024-10-17T10:00:00",
      // },
      // {
      //   title:
      //     "Indonesia jadi negara layak investasi, dunia usaha makin menggeliat",
      //   link: "https://www.liputan6.com/bisnis/read/5752871/indonesia-jadi-negara-layak-investasi-dunia-usaha-makin-menggeliat",
      //   isPublished: true,
      //   created_at: "2024-10-19T10:00:00",
      // },
      // {
      //   title:
      //     "Inovasi Ramah Lingkungan Jadi Sorotan di Megabuild Indonesia 2025",
      //   link: "https://www.jpnn.com/news/inovasi-ramah-lingkungan-jadi-sorotan-di-megabuild-indonesia-2025",
      //   isPublished: true,
      //   created_at: "2025-01-17T10:00:00",
      // },
      // {
      //   title:
      //     "Megabuild Indonesia 2025 Hadirkan Teknologi Hijau dan Praktik Efisien Untuk Pembangunan infrastruktur berkelanjutan",
      //   link: "https://athome.id/megabuild-indonesia-2025-hadirkan-teknologi-hijau-dan-praktik-efisien-untuk-pembangunan-infrastruktur-berkelanjutan/",
      //   isPublished: true,
      //   created_at: "2025-01-17T10:00:00",
      // },
      // {
      //   title:
      //     "Megabuild Indonesia Dorong Inovasi dan Pembangunan Berkelanjutan Melalui Kampanye #IndonesiaEcoCon",
      //   link: "https://bisnistoday.com/2025/01/17/megabuild-indonesia-dorong-inovasi-dan-pembangunan-berkelanjutan-melalui-kampanye-indonesiaecocon",
      //   isPublished: true,
      //   created_at: "2025-01-17T10:00:00",
      // },
      // {
      //   title:
      //     "Pemanfaatan Energi Surya dan Teknologi Rumah Pintar Didorong untuk Pembangunan Berkelanjutan",
      //   link: "https://www.tribunnews.com/bisnis/2025/01/18/pemanfaatan-energi-surya-dan-teknologi-rumah-pintar-didorong-untuk-pembangunan-berkelanjutan",
      //   isPublished: true,
      //   created_at: "2025-01-18T10:00:00",
      // },
      // {
      //   title: "Megabuild Umumkan Kolaborasi Strategis dengan Synergy",
      //   link: "https://investor.id/business/387425/megabuild-umumkan-kolaborasi-strategis-dengan-synergy",
      //   isPublished: true,
      //   created_at: "2025-01-24T10:00:00",
      // },
      // {
      //   title:
      //     "Megabuild-Synergy Inarkos hadirkan paviliun bertema inovasi teknologi",
      //   link: "https://www.antaranews.com/berita/4607854/megabuild-synergy-inarkos-hadirkan-paviliun-bertema-inovasi-teknologi",
      //   isPublished: true,
      //   created_at: "2025-01-25T10:00:00",
      // },
      // {
      //   title:
      //     "Pameran Megabuild Indonesia Siap Mendorong Inovasi dan Pembangunan Berkelanjutan",
      //   link: "https://industri.kontan.co.id/news/pameran-megabuild-indonesia-siap-mendorong-inovasi-dan-pembangunan-berkelanjutan",
      //   isPublished: true,
      //   created_at: "2025-01-26T10:00:00",
      // },
      // {
      //   title:
      //     "Produsen Bahan Bangunan Ngumpul di JICC, Konsep Hijau Jadi Sorotan",
      //   link: "https://www.detik.com/properti/berita/d-7752169/produsen-bahan-bangunan-ngumpul-di-jicc-konsep-hijau-jadi-sorotan",
      //   isPublished: true,
      //   created_at: "2025-01-27T10:00:00",
      // },
      // {
      //   title:
      //     "Instalasi Green Haven, Wujudkan Impian Hunian Sehat Berkelanjutan di Tahun Ular Kayu",
      //   link: "https://www.liputan6.com/health/read/5897338/instalasi-green-haven-wujudkan-impian-hunian-sehat-berkelanjutan-di-tahun-ular-kayu",
      //   isPublished: true,
      //   created_at: "2025-01-27T10:00:00",
      // },
      // {
      //   title:
      //     "Dukung Implementasi SDG's, Megabuild 2025 Hadirkan Instalasi Rumah Green Haven",
      //   link: "https://www.merdeka.com/jakarta/dukung-implementasi-sdgs-megabuild-2025-hadirkan-instalasi-rumah-green-haven-307080-mvk.html",
      //   isPublished: true,
      //   created_at: "2025-02-03T10:00:00",
      // },
      // {
      //   title:
      //     "MEGABUILD 2025 Hadirkan Green Haven, Instalasi Rumah Berkelanjutan Pertama di Pameran Bahan Bangunan Indonesia",
      //   link: "https://wartaekonomi.co.id/read557055/megabuild-2025-hadirkan-green-haven-instalasi-rumah-berkelanjutan-pertama-di-pameran-bahan-bangunan-indonesia ",
      //   isPublished: true,
      //   created_at: "2025-02-06T10:00:00",
      // },
      // {
      //   title:
      //     "Instalasi Rumah Berkelanjutan Ramaikan Pameran Bahan Bangunan Indonesia",
      //   link: "https://mediaindonesia.com/ekonomi/741559/instalasi-rumah-berkelanjutan-ramaikan-pameran-bahan-bangunan-indonesia",
      //   isPublished: true,
      //   created_at: "2025-02-06T10:00:00",
      // },
      // {
      //   title:
      //     "Megabuild Indonesia Dukung Industri Konstruksi Ramah Lingkungan",
      //   link: "https://money.kompas.com/read/2025/02/09/224654926/megabuild-indonesia-dukung-industri-konstruksi-ramah-lingkungan",
      //   isPublished: true,
      //   created_at: "2025-02-09T10:00:00",
      // },
      // {
      //   title:
      //     "Megabuild Indonesia 2025 Tampilkan Instalasi Rumah Berkelanjutan Green Haven",
      //   link: "https://swa.co.id/read/456243/megabuild-indonesia-2025-tampilkan-instalasi-rumah-berkelanjutan-green-haven",
      //   isPublished: true,
      //   created_at: "2025-02-10T10:00:00",
      // },
      // {
      //   title: "",
      //   link: "",
      //   isPublished: true,
      //   created_at: "2024-10-02T10:00:00",
      // },
    ],
  }),

  getters: {
    getPublishedNews: (state) => () => {
      return state.list.filter((item) => item.isPublished);
    },
  },
});
