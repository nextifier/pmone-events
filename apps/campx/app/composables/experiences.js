import { defineStore } from "pinia";

export const useExperienceStore = defineStore("experiences", {
  state: () => ({
    list: [
      {
        title: "Day Trip Pass: Main Sepuasnya!",
        slug: "day-trip",
        status: "Available",
        categories: ["Day Trip", "Paket Personal"],
        shortDescription:
          "Gak perlu nginep buat nikmatin CampX! Cuma bayar sekali, bebas main & foto-foto seharian.",
        description: `
          <p>Pengen <strong>healing</strong> tapi waktu mepet? <strong>Gas keun</strong> aja Day Trip ke CampX! Cuma modal cepek, kamu udah bisa nikmatin pemandangan danau, foto-foto di spot <i>aesthetic</i>, plus bebas main sepeda, mancing, sampe <i>stand-up paddle board</i>. Kurang asik apa coba?</p>
        `,
        coverImage: "/img/experiences/cover-day-trip.jpg",
        checkInOut: {
          in: "07:00",
          out: "19:00",
        },
        included: [
          "Tiket masuk CampX Jatiluhur",
          "Gratis main Stand-Up Paddle Board (SUP)",
          "Gratis sepedaan keliling area",
          "Gratis mancing (bawa alat sendiri ya!)",
          "Akses ke semua spot foto keren",
        ],
        pricing: [
          {
            label: "Harga Flat (Senin-Minggu)",
            value: 100000,
            unit: "orang",
          },
        ],
        pricingNotes: [],
      },

      {
        title: "DIY Camping: Bawa Gear Sendiri",
        slug: "camping-kavling-only",
        status: "Available",
        categories: ["Camping", "Paket Personal"],
        shortDescription:
          "Punya tenda sendiri? Mantap! Booking kavlingnya aja di sini, udah lengkap sama listrik & air.",
        description: `
          <p>Buat kamu para <strong>pro camper</strong> yang udah punya <i>gear</i> lengkap, paket ini pas banget. Cukup sewa lahannya yang strategis, view langsung ke danau. Fasilitas pendukung kayak listrik, air bersih, sampe WiFi udah kita siapin. Tinggal pasang tenda, nyalain api unggun, <i>and enjoy the vibe!</i></p>
        `,
        coverImage: "/img/experiences/cover-camping-kavling-only.jpg",
        checkInOut: {
          in: "14:00",
          out: "12:00",
        },
        included: [
          "Kavling/lahan camping 5m²",
          "Akses listrik & air bersih di kavling",
          "Akses WiFi",
          "Gratis main Stand-Up Paddle Board, Sepeda & Mancing",
          "Akses ke fasilitas umum (toilet, musholla, dll)",
        ],
        excluded: [
          "Tenda & perlengkapan tidur",
          "Peralatan masak & makan",
          "Perlengkapan camping pribadi lainnya",
        ],
        pricing: [
          {
            label: "Weekday (Senin-Kamis)",
            value: 125000,
            unit: "orang/malam",
          },
          {
            label: "Weekend (Jumat-Minggu)",
            value: 175000,
            unit: "orang/malam",
          },
        ],
        pricingNotes: [
          "Harga di atas berlaku untuk pemesanan minimal 2 orang.",
          "Dateng lebih dari berdua? Cuma nambah Rp75rb/orang/malam.",
        ],
      },

      {
        title: "Camping Anti Ribet: Tinggal Bawa Badan!",
        slug: "camping-tent-included",
        status: "Available",
        categories: ["Camping", "Paket Personal"],
        shortDescription:
          "Niat camping tapi mager bawa barang? Tenang, semua udah kita siapin & pasangin. Kamu tinggal dateng!",
        description: `
          <p>Stop wacana camping gara-gara gak punya tenda! Di paket ini, semua perlengkapan dari tenda, matras lipat, sampe lampu udah kita <strong>set up</strong>-in cantik di kavling pilihanmu. Kamu tinggal bawa baju ganti sama <i>good vibes</i> aja. <i>Simple as that!</i></p>
        `,
        coverImage: "/img/experiences/cover-camping-tent-included.jpg",
        checkInOut: {
          in: "14:00",
          out: "12:00",
        },
        included: [
          "Kavling/lahan camping 5m²",
          "Akses listrik & air bersih di kavling",
          "Akses WiFi",
          "Gratis main Stand-Up Paddle Board, Sepeda & Mancing",
          "Akses ke fasilitas umum (toilet, musholla, dll)",
          "Tenda kapasitas 2-4 orang (sudah terpasang)",
          "Matras lipat untuk 2 orang",
          "Lampu tenda",
        ],
        excluded: ["Peralatan masak & makan pribadi"],
        pricing: [
          {
            label: "Weekday (Senin-Kamis)",
            value: 232500,
            unit: "orang/malam",
          },
          {
            label: "Weekend (Jumat-Minggu)",
            value: 282500,
            unit: "orang/malam",
          },
        ],
        pricingNotes: [
          "Harga di atas berlaku untuk pemesanan minimal 2 orang.",
          "Dateng lebih dari berdua? Cuma nambah Rp75rb/orang/malam.",
        ],
      },

      {
        title: "Camping di Cabin X: Camping Level Up!",
        slug: "cabin",
        status: "Available",
        categories: ["Camping", "Cabin", "Paket Personal"],
        shortDescription:
          "Mau ngerasain camping dengan suasana yang lebih eksklusif? Cabin is the answer! Tidur enak, bangun-bangun langsung liat view danau.",
        description: `
          <p>Bosen sama tenda? Waktunya <i>upgrade</i> ke <strong>Cabin X</strong>! Nikmatin indahnya nginep di alam tanpa perlu repot bawa dan pasang tenda. Pintu dibuka, eh, langsung disapa pemandangan Waduk Jatiluhur yang <i>spectacular</i>. Cocok buat <i>romantic getaway</i> atau <i>chill</i> bareng <i>bestie</i>.</p>
        `,
        coverImage: "/img/experiences/cover-cabin.jpg",
        checkInOut: {
          in: "14:00",
          out: "12:00",
        },
        included: [
          "Kabin eksklusif dengan view danau",
          "Luas kabin 7m²",
          "Matras lipat untuk 2 orang",
          "Akses listrik & air bersih di kavling",
          "Akses WiFi",
          "Gratis main Stand-Up Paddle Board, Sepeda & Mancing",
          "Kamar mandi sharing / outdoor",
          "Akses ke fasilitas umum (toilet, musholla, dll)",
        ],
        excluded: [],
        pricing: [
          {
            label: "Weekday (Senin-Kamis)",
            value: 175000,
            unit: "orang/malam",
          },
          {
            label: "Weekend (Jumat-Minggu)",
            value: 225000,
            unit: "orang/malam",
          },
        ],
        pricingNotes: [
          "Harga di atas berlaku untuk pemesanan minimal 2 orang.",
          "Dateng lebih dari berdua? Cuma nambah Rp75rb/orang/malam.",
        ],
        photos: [
          "/img/experiences/cabin/1.jpg",
          "/img/experiences/cabin/2.jpg",
          "/img/experiences/cabin/3.jpg",
          "/img/experiences/cabin/4.jpg",
          "/img/experiences/cabin/5.jpg",
          "/img/experiences/cabin/6.jpg",
          "/img/experiences/cabin/7.jpg",
          "/img/experiences/cabin/8.jpg",
          "/img/experiences/cabin/9.jpg",
          "/img/experiences/cabin/10.jpg",
          "/img/experiences/cabin/11.jpg",
          "/img/experiences/cabin/12.jpg",
          "/img/experiences/cabin/13.jpg",
          "/img/experiences/cabin/14.jpg",
          "/img/experiences/cabin/15.jpg",
          "/img/experiences/cabin/16.jpg",
          "/img/experiences/cabin/17.jpg",
          "/img/experiences/cabin/18.jpg",
          "/img/experiences/cabin/19.jpg",
          "/img/experiences/cabin/20.jpg",
        ],
      },

      {
        title: "Jelajah Danau pake Paddle Board",
        slug: "stand-up-paddle",
        status: "Available",
        categories: ["Activity"],
        shortDescription:
          "Uji keseimbanganmu sambil nikmatin pemandangan danau yang keren. Seru dan sporty!",
        description: `
          <p>Pernah liat orang dayung sambil berdiri di atas papan? Yes, itu <strong>Stand-Up Paddle Boarding (SUP)</strong>! Di sini kamu bisa cobain sendiri. Gak usah takut, nanti ada tim kami yang ngajarin. Dijamin jadi pengalaman baru yang gak terlupakan.</p>
        `,
        coverImage: "/img/experiences/cover-stand-up-paddle.jpg",
        included: [
          "Sewa Stand-Up Paddle Board (SUP)",
          "Pelampung",
          "Briefing singkat dari tim kami",
        ],
        excluded: [
          "Tiket masuk (jika tidak mengambil paket menginap/day trip)",
        ],
        pricing: [
          {
            label: "Sesi 30 Menit",
            value: 100000,
            unit: "orang",
          },
          {
            label: "Sesi 1 Jam",
            value: 150000,
            unit: "orang",
          },
        ],
      },

      {
        title: "Mancing Mania, Mantap!",
        slug: "strike-the-lake",
        status: "Available",
        categories: ["Activity"],
        shortDescription:
          "Hobi mancing? Spot di CampX juara! Bawa alat pancingmu dan buktiin skill-mu di sini.",
        description: `
          <p>Buat para mancing mania, danau Jatiluhur itu surga! Kamu bisa lempar umpan dari pinggir danau di area CampX. Siapa tau dapet ikan jumbo. Jangan lupa bawa peralatanmu sendiri, ya!</p>
        `,
        coverImage: "/img/experiences/cover-mancing.jpg",
        included: ["Spot memancing di area CampX"],
        excluded: [
          "Alat pancing dan umpan",
          "Tiket masuk (jika tidak mengambil paket menginap/day trip)",
        ],
        pricing: [
          {
            label: "Akses mancing seharian",
            value: 50000,
            unit: "orang",
          },
        ],
      },

      {
        title: "Keliling Danau Naik Perahu",
        slug: "boat-experience",
        status: "Available",
        categories: ["Activity"],
        shortDescription:
          "Ajak rombonganmu keliling Waduk Jatiluhur yang luas. Pemandangannya? Gak usah ditanya!",
        description: `
          <p>Cara terbaik menikmati kemegahan Waduk Jatiluhur adalah dengan berkeliling naik perahu. Ajak teman-teman atau keluargamu buat <strong>boat trip</strong> singkat. Kamu bakal liat pemandangan perbukitan dan keramba apung dari dekat. Jangan lupa siapin kamera!</p>
        `,
        coverImage: "/img/experiences/cover-boat.jpg",
        included: [
          "Sewa perahu (kapasitas 10-15 orang)",
          "Driver perahu",
          "Pelampung",
        ],
        excluded: [
          "Tiket masuk (jika tidak mengambil paket menginap/day trip)",
        ],
        pricing: [
          {
            label: "Trip keliling danau (durasi ±1 jam)",
            value: 350000,
            unit: "perahu",
          },
        ],
      },

      {
        title: "Jetski Experience: Pacu Adrenalin di Atas Air!",
        slug: "jetski-experience",
        status: "Available",
        categories: ["Activity"],
        shortDescription:
          "Rasakan sensasi kecepatan di atas danau Jatiluhur. Siap basah-basahan dan seru-seruan bareng teman?",
        description: `
          <p>Pacu adrenalinmu dengan mencoba <strong>Jetski Experience</strong> di Danau Jatiluhur! Gak perlu pengalaman, karena kapten kami yang profesional akan ngajarin kamu cara mengendarainya dari nol.</p>
          <p>Satu jetski bisa buat boncengan berdua atau bahkan bertiga sama si kecil. Dijamin seru, aman, dan pastinya dapet dokumentasi keren dari drone yang akan kami kirimkan gratis!</p>
        `,
        coverImage: "/img/experiences/cover-jetski.jpg",
        included: [
          "1 unit Jetski",
          "Pelampung (Life Jacket)",
          "Panduan dari kapten profesional",
          "Dokumentasi gratis (foto & video drone)",
          "Akses fasilitas bilas, toilet, & musholla",
        ],
        excluded: [
          "Tiket masuk CampX (jika tidak mengambil paket menginap/day trip)",
        ],
        pricing: [
          {
            label: "Durasi 7 Menit",
            value: 300000,
            unit: "jetski",
          },
          {
            label: "Durasi 15 Menit",
            value: 600000,
            unit: "jetski",
          },
          {
            label: "Durasi 30 Menit",
            value: 1000000,
            unit: "jetski",
          },
          {
            label: "Durasi 1 Jam",
            value: 1700000,
            unit: "jetski",
          },
        ],
        pricingNotes: ["Kapasitas: 2 orang dewasa + 1 anak kecil per jetski."],
      },

      {
        title: "Jetcar Experience: Mobil Sport di Atas Air!",
        slug: "jetcar-experience",
        status: "Available",
        categories: ["Activity"],
        shortDescription:
          "Bukan jetski biasa! Kendarai mobil sport keren yang bisa meluncur di atas danau. Sensasi unik yang wajib dicoba!",
        description: `
          <p>Pernah kebayang nyetir <strong>mobil sport</strong> di atas air? Sekarang bukan mimpi lagi! <strong>Jetcar Experience</strong> hadir buat kamu yang pengen sensasi beda dari jetski biasa.</p>
          <p>Bentuknya persis kayak mobil sport kece, tapi bisa meluncur kencang di atas Danau Jatiluhur. Bisa dinaiki sampai <strong>4 orang</strong> sekaligus, cocok buat seru-seruan bareng squad atau keluarga. Dijamin jadi <i>highlight</i> liburanmu yang bakal bikin temen-temen iri!</p>
          <p>Tenang, semua sudah include pelampung dan dokumentasi drone yang keren. Tinggal gas, pose, dan pulang bawa konten viral!</p>
        `,
        coverImage: "/img/experiences/cover-jetcar.jpg",
        included: [
          "1 unit Jetcar (bentuk mobil sport)",
          "Pelampung (Life Jacket) untuk semua penumpang",
          "Dokumentasi gratis (foto & video drone)",
          "Akses fasilitas bilas, toilet, & musholla",
        ],
        excluded: [
          "Tiket masuk CampX (jika tidak mengambil paket menginap/day trip)",
        ],
        pricing: [
          {
            label: "Durasi 7 Menit",
            value: 350000,
            unit: "jetcar",
          },
          {
            label: "Durasi 15 Menit",
            value: 600000,
            unit: "jetcar",
          },
          {
            label: "Durasi 30 Menit",
            value: 1200000,
            unit: "jetcar",
          },
          {
            label: "Durasi 1 Jam",
            value: 2200000,
            unit: "jetcar",
          },
        ],
        pricingNotes: [
          "Kapasitas: maksimal 4 orang dengan total berat di bawah 200 KG.",
        ],
      },

      {
        title: "Canoeing Seru di Jatiluhur",
        slug: "canoeing-experience",
        status: "Maintenance",
        categories: ["Activity"],
        shortDescription:
          "Dayung santai bareng temen atau pasangan sambil keliling danau. Perfect for chilling!",
        description: `
          <p>Mau aktivitas air yang lebih santai? Cobain <strong>canoeing</strong>, deh! Kamu bisa dayung perahu kano sambil nikmatin tenangnya air danau Jatiluhur. Satu perahu bisa buat berdua atau bertiga, asik buat quality time.</p>
        `,
        coverImage: "/img/experiences/cover-canoeing.jpg",
        included: [
          "Sewa perahu kano (kapasitas 3 orang)",
          "Dayung & pelampung",
        ],
        excluded: [
          "Tiket masuk (jika tidak mengambil paket menginap/day trip)",
        ],
        pricing: [
          {
            label: "Sewa perahu per jam",
            value: 250000,
            unit: "perahu",
          },
        ],
      },

      {
        title: "Paket Outing: Boyer Hill Summit Challenge - Day Trip",
        slug: "boyer-hill-summit-challenge-day-trip",
        status: "Available",
        categories: ["Paket Grup", "Team Building"],
        shortDescription:
          "Aktivitas team building seharian yang menantang! Hiking, naik perahu, plus fun games buat tim-mu.",
        description: `
          <p>Siap bikin tim kamu makin kompak? Ajak mereka buat naklukin <strong>Tebing Boyer</strong>! Perjalanan seru naik perahu, <i>hiking</i> dengan pemandangan aduhai, ditutup sama sesi <i>fun games</i> yang dipandu fasilitator profesional. Pulang-pulang dijamin makin solid!</p>
        `,
        coverImage: "/img/experiences/cover-boyer-hill-day-trip.jpg",
        included: [
          "Perjalanan dengan perahu ke & dari titik hiking",
          "Trekking ke Tebing Boyer",
          "1x Makan Siang / 2x Snack",
          "Sesi Team-building & Fun Games",
          "Fasilitator profesional & dokumentasi",
          "Aula untuk berkumpul & Parkir",
        ],
        excluded: [],
        rundown: [
          {
            day: 1,
            list: [
              "Welcome & Registrasi di CampX",
              "Ice Breaking & Pembagian Kelompok",
              "Berlayar ke Kaki Tebing Boyer",
              "Safety Briefing & Start Hiking",
              "Puncak Boyer: Foto & Nikmati Pemandangan",
              "Kembali ke CampX",
              "Makan Siang & Istirahat",
              "Sesi Fun Games & Team Building",
              "Penutupan & Sayonara",
            ],
          },
        ],
        pricing: [
          {
            label: "Minimal 20 orang",
            value: 549000,
            unit: "orang",
          },
        ],
      },

      {
        title: "Paket Outing: Boyer Hill Summit Challenge - Camping (2D1N)",
        slug: "boyer-hill-summit-challenge-camping",
        status: "Available",
        categories: ["Paket Grup", "Team Building"],
        shortDescription:
          "Paket team building paling lengkap! Hiking, main games, nginep di tenda, plus bonfire party!",
        description: `
          <p>Gak cukup seharian? Ambil paket <strong>2D1N</strong>! Setelah seharian berpetualang naklukin Tebing Boyer, malemnya kita lanjut <i>chill</i> di depan api unggun. Paginya, masih ada sesi <i>fun games</i> lagi. Kebersamaannya dapet banget!</p>
        `,
        coverImage: "/img/experiences/cover-boyer-hill-camping.jpg",
        included: [
          "Semua fasilitas dari paket Day Trip Boyer Hill",
          "Menginap di tenda (kapasitas 3 orang)",
          "Matras & lampu tenda",
          "Makan Malam (Buffet)",
          "Sarapan",
          "Api Unggun",
        ],
        excluded: [],
        rundown: [
          {
            day: 1,
            list: [
              "Tiba di CampX, Welcome Drink & Registrasi",
              "Ice Breaking & Pembagian Tim",
              "Berlayar & Hiking ke Puncak Boyer",
              "Kembali ke CampX & Makan Siang",
              "Check-in Tenda & Free Time",
              "Makan Malam & Ramah Tamah",
              "Api Unggun & Malam Keakraban",
              "Istirahat",
            ],
          },
          {
            day: 2,
            list: [
              "Sunrise & Sarapan Pagi",
              "Sesi Fun Games & Team Competition",
              "Free Time (Bisa main air atau santai)",
              "Persiapan Pulang & Check-out",
            ],
          },
        ],
        pricing: [
          {
            label: "Minimal 20 orang",
            value: 749000,
            unit: "orang",
          },
        ],
      },
    ],
  }),

  getters: {
    getItemBySlug: (state) => (slug) => {
      return state.list.find((item) => item.slug === slug) || null;
    },

    getItemsByCategories: (state) => (category) => {
      if (!category) {
        return [];
      }
      return state.list.filter((item) => {
        return item.categories && item.categories.includes(category);
      });
    },

    getOtherExperiencesBySlug: (state) => {
      return (slugToExclude) => {
        const currentExperience = state.list.find(
          (item) => item.slug === slugToExclude,
        );
        if (!currentExperience) {
          return state.list.filter((item) => item.slug !== slugToExclude);
        }

        const currentCategories = currentExperience.categories;
        const relatedExperiences = [];
        const otherUnrelatedExperiences = [];

        state.list.forEach((item) => {
          if (item.slug === slugToExclude) return;

          const isRelated = item.categories.some((cat) =>
            currentCategories.includes(cat),
          );
          if (isRelated) {
            relatedExperiences.push(item);
          } else {
            otherUnrelatedExperiences.push(item);
          }
        });

        return [...relatedExperiences, ...otherUnrelatedExperiences];
      };
    },
  },
});
