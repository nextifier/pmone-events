import { defineStore } from "pinia";

export const useFAQStore = defineStore("faq", {
  state: () => ({
    list: [
      {
        q: "Di mana lokasi persisnya CampX?",
        a: `
          <p>CampX berada di <strong>Jl. Waduk Jatiluhur, Jatimekar, Kec. Jatiluhur, Kabupaten Purwakarta, Jawa Barat.</strong></p>
          <p>Lokasi kami persis di tepi danau, jadi pemandangannya dijamin keren! Untuk rute terbaik, kamu bisa langsung <a href="https://maps.app.goo.gl/YsxHzezAu8Vpnrvx5" target="_blank">klik link Google Maps di sini</a>.</p>
        `,
      },
      {
        q: "Bagaimana cara reservasi atau booking di CampX?",
        a: `
          <p>Semua reservasi untuk menginap (camping/kabin) dilakukan secara online melalui <strong>WhatsApp resmi kami</strong> untuk memastikan ketersediaan tempat. Kamu bisa klik tombol 'Pesan Sekarang' di paket yang kamu inginkan.</p>
        `,
      },
      {
        q: "Fasilitas umum apa saja yang tersedia?",
        a: `
          <p>Kami menyediakan fasilitas lengkap untuk kenyamananmu, termasuk toilet bersih, musholla, area parkir yang luas, colokan listrik & keran air di setiap kavling, serta beberapa warung untuk kebutuhan jajan dan makanmu.</p>
        `,
      },
      {
        q: "Jika saya belum punya alat, apakah bisa sewa peralatan camping?",
        a: `
          <p>Tentu saja! Kalau kamu tidak punya atau malas bawa peralatan sendiri, kami menyediakan sewa tenda, sleeping bag, matras, dan peralatan lainnya dengan biaya terpisah.</p>
          <p>Untuk yang paling praktis, kami sarankan untuk langsung mengambil paket 'Camping Anti Ribet' karena semuanya sudah kami siapkan untukmu.</p>
        `,
      },
      {
        q: "Jam check-in dan check-out untuk tamu menginap jam berapa?",
        a: `
          <p>Waktu <strong>check-in</strong> dimulai dari pukul <strong>14:00</strong> hingga <strong>17:00</strong>.</p>
          <p>Sementara waktu <strong>check-out</strong> adalah maksimal pukul <strong>12:00</strong> di hari berikutnya. Ini memberimu banyak waktu untuk menikmati pagi di tepi danau!</p>
        `,
      },
      {
        q: "Apakah CampX cocok untuk acara grup seperti outing kantor?",
        a: `
          <p>Sangat cocok! CampX adalah tempat yang ideal untuk berbagai acara grup, mulai dari <strong>outing kantor, team building, gathering komunitas, hingga wedding</strong>.</p>
          <p>Kami punya paket grup yang bisa disesuaikan dengan kebutuhan acaramu. Silakan hubungi kami melalui halaman kontak untuk diskusi dan mendapatkan penawaran terbaik.</p>
        `,
      },
      {
        q: "Apakah ada batasan jam malam di CampX?",
        a: `
          <p>Ya, kami memberlakukan <strong>jam tenang mulai pukul 22:00</strong>. Pada jam ini, kami meminta semua pengunjung untuk mengecilkan volume suara, meredupkan lampu, dan menghormati tetangga sekitar agar semua bisa beristirahat dengan nyaman.</p>
        `,
      },
    ],
  }),
});
