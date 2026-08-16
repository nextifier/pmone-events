# CampX Copy Deck

Semua teks yang tampil di campx.id, disusun per halaman per section. Dibuat untuk
dipakai saat mendesain ulang di Figma: salin dari sini, jangan tulis ulang.

Sumber teknisnya ada di dua tempat. Copy struktural (heading, eyebrow, CTA,
empty state) ada di file `.vue` halaman masing-masing. Copy yang menempel ke data
(nama paket, deskripsi, harga, FAQ, cerita lokasi) ada di `app/data/`. Kalau
copy di sini berubah, ubah juga di sumbernya, jangan cuma di dokumen ini.

---

## 1. Aturan menulis

Tujuh aturan yang berlaku di semua teks di situs ini.

**Bahasa Indonesia yang diucapkan, bukan diterjemahkan.** Kalimatnya harus
kedengaran seperti orang CampX menjelaskan ke calon tamu, bukan hasil translate
dari brosur Inggris. "Masuk gratis" itu calque dari "free entry"; yang benar
"gratis buat tamu yang menginap".

**Istilah teknis tetap Inggris.** Rafting, day trip, check-in, flying fox,
paintball, tentsite, cabin, outing, team building. Memaksa menerjemahkannya
malah bikin susah dibaca dan merusak keyword.

**Tanpa em dash.** Pakai koma, titik, atau tanda hubung biasa.

**Angka yang tidak ada sumbernya tidak ditulis.** Kapasitas Cikidang, jam
check-in Cikidang, dan tarif masuk harian belum pernah dipublikasikan, jadi
tidak muncul di mana pun. Section yang datanya kosong hilang sendiri.

**Jawab dulu, jelaskan belakangan.** Berlaku terutama di FAQ. Pertanyaan
"Belum bisa berenang, boleh ikut rafting?" dijawab "Boleh." di kata pertama,
bukan di paragraf kedua.

**Judul yang bisa dicari, bukan slogan.** `title` paket adalah nama faktual
("Rafting Salamander"), `subtitle` yang boleh bergaya ("5 kilometer, sekitar
1 jam"). Dulu dua-duanya digabung jadi satu ("Day Trip Pass: Main Sepuasnya!"),
akibatnya tidak ada satu pun kata yang orang ketik di Google.

**Satu kalimat panjang, satu kalimat pendek.** Tiga kalimat berturut-turut
dengan panjang yang sama langsung terasa seperti mesin.

### Yang dilarang

| Jangan | Kenapa |
|---|---|
| "Nikmati pengalaman tak terlupakan" | Kalimat brosur. Tidak menjelaskan apa pun |
| "Tidak hanya X, tapi juga Y" | Tulis Y-nya saja |
| Tiga item di setiap daftar | Dua cukup. Yang ketiga harus punya alasan |
| Bold di tengah kalimat | Satu penekanan per section, kalau memang perlu |
| "Kami berkomitmen untuk" | Tunjukkan, jangan diklaim |
| Angka rating sebagai klaim sendiri | 4,6 Google dan 4,9 TikTok selalu ditulis dengan sumbernya |

---

## 2. Identitas

| Kolom | Isi |
|---|---|
| Nama lengkap | CampX Holiday Park |
| Nama pendek | CampX |
| Cabang 1 | CampX Jatiluhur (Purwakarta, Jawa Barat) |
| Cabang 2 | CampX Cikidang (Sukabumi, Jawa Barat) |
| Badan usaha | PT Panorama Yogya Wisata |
| Domain | campx.id |

**Satu kalimat kalau cuma boleh satu:**
Camping di tepi Waduk Jatiluhur dan arung jeram Sungai Citarik, dua holiday park
di Jawa Barat.

**Tiga kalimat kalau ada ruang:**
CampX mengelola dua holiday park di Jawa Barat. Jatiluhur di Purwakarta, di tepi
waduk terbesar di Indonesia. Cikidang di Sukabumi, di tepi Sungai Citarik yang
jadi jalur arung jeram paling terkenal di Jawa Barat.

---

## 3. Beranda

### 3.1 Hero

| Slot | Teks |
|---|---|
| Eyebrow | Jatiluhur, Purwakarta · Cikidang, Sukabumi |
| H1 | Camping, rafting, dan outing di dua holiday park Jawa Barat |
| Sub | Satu di tepi Waduk Jatiluhur, satu lagi di tepi Sungai Citarik. Perlengkapannya sudah ada di tempat, kamu tinggal datang. |
| CTA utama | Lihat semua paket |
| CTA kedua | Rencanakan outing kantor |

Strip rating Google dan TikTok dihapus dari hero pada Agustus 2026. Angkanya
disalin manual, jadi beku sejak hari diketik dan makin meleset tiap ada ulasan
baru. Kalau mau dipasang lagi, harus dari sumber yang hidup, bukan konstanta.

**Alternatif H1** kalau desainnya butuh yang lebih pendek:
- Dua holiday park, satu di danau satu di sungai
- Camping dan rafting, dua jam dari Jakarta

### 3.2 Pemilih cabang

| Slot | Teks |
|---|---|
| H2 | Pilih cabangnya dulu |
| Sub | Danau yang tenang di Purwakarta, atau sungai berarus di Sukabumi. |
| Badge cabang baru | Baru |
| Fakta di kartu | ±2 jam dari Jakarta · Mulai Rp50rb |

Isi kartunya diambil dari data lokasi (lihat bagian 5).

### 3.3 Rail paket

Enam baris carousel, judul dan deskripsinya:

| Rail | Judul | Deskripsi | Tombol |
|---|---|---|---|
| Menginap | Menginap di alam | Tenda, kavling, atau cabin. Di dua cabang. | Lihat semua |
| Rafting | Rafting Sungai Citarik | Lima jalur, dari 5 sampai 17 kilometer. | Lihat semua |
| Aktivitas air | Main air di Jatiluhur | Paddle board, perahu, dan mancing di tepi waduk. | Lihat semua |
| Aktivitas darat | Adrenalin di darat | Flying fox, ATV, trekking, dan paintball di Cikidang. | Lihat semua |
| Trip & outing | Day trip & outing rombongan | Rangkaian sehari penuh sampai dua hari satu malam. | Lihat semua |
| Cabang baru | Semua di CampX Cikidang | Cabang terbaru kami di Sukabumi. | Lihat semua |

Rail yang paketnya kosong hilang sendiri, jadi tidak perlu state kosong.

### 3.4 Kenapa CampX

Empat poin, judul dan isinya:

| Judul | Isi |
|---|---|
| Perlengkapan sudah di tempat | Tenda, matras, dan lampu terpasang sebelum kamu sampai. Tidak perlu belanja atau meminjam. |
| Dekat dari kota | Jatiluhur dua jam dari Jakarta lewat Tol Cipularang. Cikidang lewat Tol Bocimi. |
| Aktivitas berpemandu | Rafting dan aktivitas lain dijalankan dengan pemandu, tim rescue, dan asuransi peserta. |
| Siap untuk rombongan | Aula, amfiteater 200 orang, dan fasilitator untuk outing kantor. |

### 3.5 Band korporat

| Slot | Teks |
|---|---|
| Eyebrow | Untuk perusahaan |
| H2 | Outing yang acaranya kami susun |
| Body | Rombongan kantor, komunitas, dan sekolah biasanya datang dengan kendala yang sama: pesertanya banyak, waktunya sempit. Susunan acara, fasilitator, dan dokumentasinya kami yang urus. |
| CTA utama | Lihat paket outing |
| CTA kedua | Minta penawaran |

### 3.6 Liputan media

| Slot | Teks |
|---|---|
| Judul | Diliput oleh |
| Isi | detikJabar · TRAC Astra · Radar Depok · Sukabumi Update |

### 3.7 Meta

| Slot | Teks |
|---|---|
| Title | CampX Holiday Park: Camping, Rafting & Outing Jawa Barat |
| Description | Camping tepi Waduk Jatiluhur dan arung jeram di Cikidang, Sukabumi. Paket harian, menginap, sampai outing kantor. Mulai Rp50rb per orang. |

---

## 4. Katalog paket (`/paket`)

| Slot | Teks |
|---|---|
| Title | Semua Paket Camping, Rafting & Outing |
| Description | 24 paket di dua cabang CampX: menginap, aktivitas air, arung jeram, day trip, dan outing rombongan. Saring sesuai lokasi, harga, dan jumlah orang. |
| Placeholder cari | Cari paket |
| Tombol filter | Filter |
| Reset | Reset filter |
| Empty state judul | Belum ada paket yang cocok |
| Empty state isi | Coba longgarkan filternya, atau hapus kata kuncinya. |

**Grup filter:** Lokasi · Tipe · Kategori · Cocok untuk · Ketersediaan
**Toggle ketersediaan:** Tampilkan yang lagi tidak tersedia
**Label sort:** Rekomendasi · Harga terendah · Harga tertinggi · Nama A-Z

**Nama tipe:** Menginap · Aktivitas · Trip · Outing · Tiket harian
**Cocok untuk:** Sendiri atau berdua · Keluarga · Rombongan · Kantor
**Nama kategori:** Camping · Cabin · Day trip · Rafting · Aktivitas air ·
Aktivitas darat · Trip · Outing · Team building

---

## 5. Halaman cabang

### 5.1 CampX Jatiluhur

| Slot | Teks |
|---|---|
| Nama | CampX Jatiluhur |
| Tagline | Camping di tepi waduk terbesar di Indonesia |
| Deskripsi pendek | Camping ground di tepi Waduk Jatiluhur, Purwakarta. Kavling menghadap air, dua jam dari Jakarta lewat Tol Cipularang. |
| Meta title | Camping & Glamping di Tepi Waduk Jatiluhur |
| Meta description | Camping, cabin, dan aktivitas air di tepi Waduk Jatiluhur, Purwakarta. Dua jam dari Jakarta. Mulai Rp100rb per orang. |

**Empat highlight:**
1. Kavling menghadap Waduk Jatiluhur langsung
2. Dua jam dari Jakarta lewat Tol Cipularang
3. SUP, sepeda, dan mancing gratis untuk tamu menginap
4. Tebing Boyer untuk outing dan team building

**Cerita panjang (SEO body, 6 paragraf):**

> CampX Jatiluhur berdiri persis di tepi Waduk Jatiluhur, waduk terbesar di
> Indonesia, sekitar dua jam berkendara dari Jakarta lewat Tol Cipularang. Yang
> membedakannya dari camping ground lain di Purwakarta itu jarak ke airnya.
> Kavlingnya menghadap danau langsung, jadi begitu buka tenda pagi-pagi yang
> kelihatan air dan perbukitan di seberang, bukan tenda tetangga.
>
> Ada tiga cara menginap di sini, dan bedanya cuma seberapa banyak barang yang
> mau kamu bawa. Sudah punya tenda dan gear sendiri? Sewa kavlingnya saja,
> listrik dan air bersih sudah tersedia di titiknya. Belum punya, atau malas
> pasang? Tendanya kami siapkan lengkap dengan matras dan lampu, kamu tinggal
> datang. Mau yang lebih nyaman lagi, ada Cabin X, bangunan tertutup dengan
> kasur dan pemandangan danau dari depan pintu.
>
> Siang harinya danau ini yang jadi tempat mainnya. Stand-up paddle board,
> sepeda, dan spot mancing bebas dipakai tamu yang menginap. Kalau mau yang
> lebih kencang ada jetski dan jetcar. Kalau mau santai, sewa perahu untuk
> keliling waduk sambil melihat keramba apung dan perbukitan dari dekat.
>
> Buat rombongan kantor, Tebing Boyer di seberang danau jadi alasan banyak tim
> datang ke sini. Perjalanannya naik perahu, lanjut hiking, lalu ditutup fun
> games yang dipandu fasilitator. Bisa selesai dalam sehari, bisa juga dilanjut
> menginap dengan api unggun.
>
> Belum siap menginap tapi penasaran? Day Trip Pass membuka seluruh area
> seharian, termasuk main SUP dan sepeda. Banyak tamu memakai ini untuk kenalan
> dulu sebelum membawa keluarganya menginap.
>
> Fasilitas dasarnya lengkap: toilet, kamar mandi, musholla, dapur bersama, area
> api unggun, dan parkir luas. WiFi menjangkau area kavling, jadi kerja jarak
> jauh dari tepi danau bukan hal aneh di sini. Check-in mulai pukul 14.00 dan
> check-out pukul 12.00, sementara jam tenang berlaku mulai pukul 22.00 supaya
> yang mau tidur cepat tetap bisa tidur.

**Alamat:** Jl. Waduk Jatiluhur, Jatimekar, Kecamatan Jatiluhur, Kabupaten
Purwakarta, Jawa Barat 41152

**Jam:** Check-in 14.00 · Check-out 12.00 · Day trip 07.00-19.00 · Jam tenang mulai 22.00

**Kapasitas:** 112 kavling camping (5 x 5 m) · 13 cabin (2,5 x 3 m) ·
50 lahan camper van (6 x 9 m) · amfiteater 200 orang

**Rute:** Dari Jakarta 100 km, ±2 jam, Tol Cipularang keluar Jatiluhur ·
Dari Bandung 70 km, ±1,5 jam, Tol Purbaleunyi keluar Sadang

**Sekitar sini:** Waduk Jatiluhur (halaman depan kami) · Jatiluhur Water World
(300 m) · Tebing Boyer (naik perahu lalu hiking) · Gunung Parang (tebing andesit
900 m, terkenal untuk via ferrata)

### 5.2 CampX Cikidang

| Slot | Teks |
|---|---|
| Nama | CampX Cikidang |
| Tagline | Rafting Citarik dan camping di tepi sungai |
| Deskripsi pendek | Camping ground dan operator arung jeram di tepi Sungai Citarik, Cikidang, Sukabumi. Lima jalur rafting, cabin A-frame, dan campground yang menempel ke sungai. |
| Meta title | Rafting Citarik & Camping di Cikidang, Sukabumi |
| Meta description | Lima jalur arung jeram Sungai Citarik, paintball, ATV, flying fox, cabin, dan campground tepi sungai di Cikidang, Sukabumi. Mulai Rp70rb per orang. |
| Badge | Baru dibuka |

**Empat highlight:**
1. Lima jalur rafting Citarik, dari 5 sampai 17 kilometer
2. Campground Riverside menempel ke Sungai Citarik
3. Cabin A-frame Saung Rumbia beratap rumbia
4. Aula bambu terbuka untuk rombongan

**Cerita panjang (SEO body, 6 paragraf):**

> CampX Cikidang buka pada Agustus 2026 dan langsung menggeser arti camping buat
> kami. Kalau Jatiluhur soal danau yang tenang, Cikidang soal Sungai Citarik yang
> lewat persis di samping campground. Ini sungai arung jeram paling terkenal di
> Jawa Barat, dan area kami ada di Kecamatan Cikidang, Kabupaten Sukabumi, di
> jalur alternatif menuju Pelabuhan Ratu.
>
> Rafting Citarik jadi menu utamanya. Ada lima jalur, dari Salamander sepanjang 5
> kilometer sekitar satu jam untuk yang baru pertama kali, sampai Grand Crocodile
> 17 kilometer yang memakan waktu lima jam. Anak umur lima tahun pun punya
> jalurnya sendiri lewat paket Baby Salamander. Semua paket sudah termasuk
> perlengkapan, pemandu, tim rescue, asuransi, dan transportasi lokal ke titik
> start.
>
> Di darat pilihannya juga banyak. Flying fox melintas di atas sungai, ATV
> keliling jalur tanah, trekking 13 kilometer menembus kebun dan kampung, dan
> paintball di lapangan khusus dengan perlengkapan lengkap. Aktivitas darat ini
> yang biasanya diambil rombongan kantor, karena minimal pesertanya kecil dan
> bisa dirangkai jadi satu hari penuh.
>
> Untuk menginap ada dua pilihan. Saung Rumbia, cabin A-frame beratap rumbia
> dengan deck kayu di depannya, muat dua orang dan sudah termasuk tempat tidur,
> kipas, listrik, air, serta set meja kursi. Atau tentsite di dua area
> campground: Middle Point yang datar dan teduh, dan Riverside yang menempel ke
> sungai. Suara airnya terdengar semalaman di Riverside, dan itu alasan orang
> memilihnya.
>
> Punya waktu satu hari penuh dan mau keluar area? Ada trip ke Geopark Ciletuh.
> Berangkat setengah delapan pagi, mampir ke Pelabuhan Ratu, dua curug, lalu
> Pantai Palangpang atau Puncak Aher, dan kembali sore hari.
>
> Fasilitas dasarnya sudah jadi: lobby dan resepsionis, aula bambu terbuka untuk
> berkumpul, kamar mandi dan shower air bersih, toilet, wastafel, listrik, WiFi,
> dan parkir. Ada juga jembatan gantung menyeberang sungai dan Taman Batu yang
> biasanya jadi rebutan untuk foto.

**Alamat:** Jl. Alternatif Cikidang - Pelabuhan Ratu RT. 5 RW. 3, Kampung Lebak
Wangi, Cijambe, Cikiray, Kecamatan Cikidang, Kabupaten Sukabumi, Jawa Barat 43367

**Rute:** Dari Jakarta ±3,5 jam lewat Tol Bocimi · Dari Bogor ±2,5 jam lewat
Cibadak · Dari Bandung ±4 jam lewat Tol Bocimi

**Sepuluh area di dalam:**

| Area | Deskripsi |
|---|---|
| Entrance Gate | Pintu masuk utama menuju area CampX Cikidang. |
| Parking Area | Parkir mobil dan motor tepat setelah gerbang. |
| Paintball Spot | Lapangan paintball dengan rintangan, untuk rombongan minimal 10 orang. |
| Flying Fox Spot | Titik luncur flying fox yang melintas di atas sungai. |
| Taman Batu | Hamparan bebatuan besar yang jadi spot foto paling ramai di area ini. |
| Lobby Receptionist & Aula | Tempat check-in sekaligus aula bambu terbuka dengan meja kursi, dipakai untuk briefing, makan bersama, dan sesi rombongan. |
| Cabin Area | Deretan Saung Rumbia, cabin A-frame dengan deck kayu di depannya. |
| Campground Middle Point | Area camping di tengah, tanahnya datar dan banyak pohon peneduh. |
| Campground Riverside | Area camping paling dekat sungai. Suara air terdengar semalaman. |
| Rafting Spot | Titik start dan finish arung jeram, di sisi hulu area campground. |

**Sekitar sini:** Geopark Ciletuh (kawasan geopark UNESCO dengan deretan curug dan
tebing laut) · Curug Cimarinjung (air terjun bertebing merah) · Curug Sodong
(air terjun kembar, tanpa trekking panjang) · Pantai Palangpang · Pelabuhan Ratu

### 5.3 Section di halaman cabang

| Section | Judul | Deskripsi |
|---|---|---|
| Highlight | Yang bikin beda di sini | (tanpa deskripsi) |
| Menginap | Menginap | Tenda, lahan camping, atau cabin. Pilih seberapa repot yang kamu mau. |
| Rafting | Arung jeram | Lima jalur dengan panjang dan durasi berbeda, semua sudah termasuk pemandu. |
| Aktivitas | Aktivitas | Yang bisa dilakukan tanpa harus menginap. |
| Trip & outing | Day trip & outing | Rangkaian sehari penuh, sendiri atau bersama rombongan kantor. |
| Fasilitas | Fasilitas | (tanpa deskripsi) |
| Zona | Area di dalam | (dari denah lokasi) |
| Galeri | Suasananya | (tanpa deskripsi) |
| Rute | Cara ke sini | (tanpa deskripsi) |
| Sekitar | Sekitar sini | (tanpa deskripsi) |
| Cabang lain | Cabang satunya | (tanpa deskripsi) |
| CTA | Reservasi | (tombol WhatsApp) |

---

## 6. Paket CampX Jatiluhur

Dua belas paket. Kolom judul dipakai sebagai H1 halaman detail, subjudul di
bawahnya, ringkasan di kartu.

### 6.1 Day Trip Pass

| Slot | Teks |
|---|---|
| Judul | Day Trip Pass |
| Subjudul | Main sepuasnya seharian tanpa menginap |
| Ringkasan | Sekali bayar, seharian bebas main dan foto-foto di area CampX Jatiluhur. |
| Badge | Cocok buat pertama kali |
| Harga | Rp100.000 /orang, flat Senin sampai Minggu |
| Durasi | Seharian, 07.00-19.00 |

**Deskripsi:**

> Tidak semua orang punya waktu buat menginap. Day Trip Pass membuka seluruh area
> CampX Jatiluhur dari pukul 07.00 sampai 19.00, dan semua yang gratis buat tamu
> menginap juga gratis buat kamu: stand-up paddle board, sepeda keliling area,
> dan spot mancing.
>
> Banyak yang memakai paket ini untuk lihat-lihat dulu sebelum membawa
> keluarganya menginap. Datang pagi, pulang sebelum gelap, dan sudah kebayang
> tempatnya seperti apa.

**Termasuk:** Tiket masuk CampX Jatiluhur · Gratis main stand-up paddle board ·
Gratis sepedaan keliling area · Gratis memancing (bawa alat sendiri) · Akses ke
semua spot foto

### 6.2 Camping Mandiri

| Slot | Teks |
|---|---|
| Judul | Camping Mandiri |
| Subjudul | Bawa tenda sendiri, kami siapkan kavlingnya |
| Ringkasan | Sudah punya gear lengkap? Sewa kavlingnya saja. Listrik dan air bersih sudah ada di titiknya. |
| Harga | Weekday Rp125.000, weekend Rp175.000 /orang/malam. Tambahan orang Rp75.000 |
| Catatan harga | Harga berlaku untuk pemesanan minimal 2 orang. |

**Deskripsi:**

> Buat yang sudah punya tenda dan perlengkapan sendiri, paket ini yang paling
> masuk akal. Kamu menyewa lahannya, dan lahannya menghadap Waduk Jatiluhur
> langsung.
>
> Listrik, air bersih, dan WiFi sudah tersedia di kavling. Tinggal pasang tenda,
> nyalakan api unggun, dan sisanya urusan kamu sama pemandangan.

**Termasuk:** Kavling camping 5m² menghadap danau · Akses listrik & air bersih di
kavling · Akses WiFi · Gratis stand-up paddle board, sepeda & memancing · Akses
fasilitas umum (toilet, musholla, kamar mandi)

**Belum termasuk:** Tenda & perlengkapan tidur · Peralatan masak & makan ·
Perlengkapan camping pribadi lainnya

### 6.3 Camping Tenda Lengkap

| Slot | Teks |
|---|---|
| Judul | Camping Tenda Lengkap |
| Subjudul | Tenda sudah terpasang, tinggal datang |
| Ringkasan | Tenda, matras, dan lampu sudah kami pasang di kavling pilihanmu. Kamu tinggal bawa baju ganti. |
| Badge | Paling banyak diambil |
| Harga | Weekday Rp232.500, weekend Rp282.500 /orang/malam. Tambahan orang Rp75.000 |

**Deskripsi:**

> Tidak punya tenda bukan alasan untuk batal camping. Di paket ini semuanya sudah
> kami siapkan dan pasang di kavling pilihanmu: tenda kapasitas 2-4 orang, matras
> lipat, dan lampu tenda.
>
> Ini paket yang paling banyak diambil tamu baru, karena tidak perlu belanja atau
> meminjam apa pun. Datang, taruh tas, langsung menikmati sore di tepi danau.

**Termasuk:** Kavling camping 5m² menghadap danau · Tenda kapasitas 2-4 orang,
sudah terpasang · Matras lipat untuk 2 orang · Lampu tenda · Akses listrik & air
bersih di kavling · Akses WiFi · Gratis stand-up paddle board, sepeda & memancing ·
Akses fasilitas umum

### 6.4 Cabin X

| Slot | Teks |
|---|---|
| Judul | Cabin X |
| Subjudul | Kabin menghadap danau, bangun langsung lihat air |
| Ringkasan | Kabin tertutup 7m² dengan matras untuk dua orang dan pemandangan Waduk Jatiluhur dari depan pintu. |
| Badge | Favorit pasangan |
| Harga | Weekday Rp175.000, weekend Rp225.000 /orang/malam. Tambahan orang Rp75.000 |

**Deskripsi:**

> Ini pilihan buat yang ingin merasakan menginap di alam tanpa memasang apa pun.
> Cabin X adalah bangunan tertutup seluas 7m² dengan matras untuk dua orang, dan
> pintunya menghadap Waduk Jatiluhur.
>
> Paling sering diambil pasangan dan tamu yang datang berdua. Kamar mandinya
> sharing di luar, seperti area camping pada umumnya, tapi tidurnya jauh lebih
> nyenyak daripada di tenda.

### 6.5 Stand-Up Paddle Board

| Slot | Teks |
|---|---|
| Judul | Stand-Up Paddle Board |
| Subjudul | Dayung sambil berdiri, keliling tepi danau |
| Ringkasan | Uji keseimbangan di atas papan sambil menyusuri tepi Waduk Jatiluhur. Ada briefing dulu buat yang baru coba. |
| Harga | Sesi 30 menit Rp100.000 · Sesi 1 jam Rp150.000 |
| Catatan | Gratis untuk tamu yang menginap. |

**Deskripsi:**

> Stand-up paddle board itu mendayung sambil berdiri di atas papan. Kelihatan
> susah, tapi hampir semua orang sudah bisa berdiri dalam sepuluh menit pertama.
>
> Tim kami memberi briefing singkat sebelum kamu turun, dan pelampung sudah
> termasuk. Tamu yang menginap bisa memakainya gratis, jadi harga di bawah
> berlaku untuk pengunjung yang datang khusus untuk SUP.

### 6.6 Mancing di Waduk Jatiluhur

| Slot | Teks |
|---|---|
| Judul | Mancing di Waduk Jatiluhur |
| Subjudul | Akses spot mancing seharian |
| Ringkasan | Lempar umpan dari tepi danau di area CampX. Bawa alat sendiri, spotnya kami sediakan. |
| Harga | Rp50.000 /orang, akses seharian |
| Catatan | Gratis untuk tamu yang menginap. |

**Deskripsi:**

> Waduk Jatiluhur sudah lama jadi tujuan pemancing dari Jakarta dan Bandung. Di
> area CampX kamu bisa memancing dari tepi danau sepanjang hari.
>
> Alat pancing dan umpan bawa sendiri. Tamu yang menginap sudah otomatis dapat
> akses ini tanpa biaya tambahan.

### 6.7 Sewa Perahu Keliling Danau

| Slot | Teks |
|---|---|
| Judul | Sewa Perahu Keliling Danau |
| Subjudul | Satu perahu untuk 10 sampai 15 orang |
| Ringkasan | Keliling Waduk Jatiluhur sekitar satu jam, lihat keramba apung dan perbukitan dari dekat. |
| Harga | Rp350.000 /perahu, trip ±1 jam |
| Catatan | Harga per perahu, bukan per orang. |

**Deskripsi:**

> Cara paling enak menikmati luasnya Waduk Jatiluhur adalah dari atas air. Satu
> perahu muat 10 sampai 15 orang, jadi harganya dibagi rombongan, bukan per orang.
>
> Rutenya menyusuri keramba apung dan kaki perbukitan di seberang. Driver perahu
> dan pelampung sudah termasuk.

### 6.8 Jetski

| Slot | Teks |
|---|---|
| Judul | Jetski |
| Subjudul | Pacu adrenalin di atas Waduk Jatiluhur |
| Ringkasan | Tidak perlu pengalaman. Kapten kami mengajari dari nol, dan dokumentasi drone sudah termasuk. |
| Status | Lagi perawatan |
| Harga | 7 menit Rp300.000 · 15 menit Rp600.000 · 30 menit Rp1.000.000 · 1 jam Rp1.700.000 |
| Catatan | Kapasitas 2 orang dewasa + 1 anak per jetski. Harga per unit, bukan per orang. |

**Deskripsi:**

> Satu jetski bisa dinaiki dua orang dewasa, atau dua dewasa plus satu anak. Kalau
> belum pernah, kapten kami akan mengajari cara mengendarainya dari nol sebelum
> kamu jalan sendiri.
>
> Foto dan video drone sudah termasuk dan kami kirim setelah sesi selesai.

### 6.9 Jetcar

| Slot | Teks |
|---|---|
| Judul | Jetcar |
| Subjudul | Mobil sport yang meluncur di atas air |
| Ringkasan | Bentuknya mobil sport, jalannya di atas danau. Muat sampai empat orang sekaligus. |
| Status | Lagi perawatan |
| Harga | 7 menit Rp350.000 · 15 menit Rp600.000 · 30 menit Rp1.200.000 · 1 jam Rp2.200.000 |
| Catatan | Maksimal 4 orang dengan total berat di bawah 200 kg. |

**Deskripsi:**

> Jetcar bentuknya persis mobil sport, tapi meluncur di atas air. Muat sampai
> empat orang, jadi ini yang biasanya diambil rombongan kecil yang ingin naik
> bareng.
>
> Pelampung dan dokumentasi drone sudah termasuk. Total berat penumpang maksimal
> 200 kilogram.

### 6.10 Kano

| Slot | Teks |
|---|---|
| Judul | Kano |
| Subjudul | Dayung santai berdua atau bertiga |
| Ringkasan | Satu perahu kano muat tiga orang. Cocok buat yang mau di atas air tanpa buru-buru. |
| Status | Lagi perawatan |
| Harga | Rp250.000 /perahu per jam |

**Deskripsi:**

> Kalau SUP terasa terlalu menantang, kano jauh lebih santai. Duduk, dayung pelan,
> dan nikmati tenangnya air Waduk Jatiluhur.
>
> Satu perahu muat tiga orang, jadi bisa berdua atau bertiga. Dayung dan pelampung
> sudah termasuk.

### 6.11 Outing Boyer Hill Summit Challenge

| Slot | Teks |
|---|---|
| Judul | Outing Boyer Hill Summit Challenge |
| Subjudul | Sehari penuh: perahu, hiking, dan fun games |
| Ringkasan | Paket outing sehari untuk minimal 20 orang. Menyeberang naik perahu, hiking ke Tebing Boyer, lalu fun games berpemandu. |
| Harga | Rp549.000 /orang, minimal 20 orang |
| Titik kumpul | Aula CampX Jatiluhur |

**Deskripsi:**

> Ini paket outing yang paling sering diambil kantor yang punya waktu sehari.
> Rombongan menyeberang danau naik perahu, hiking ke Tebing Boyer, lalu kembali
> untuk makan siang dan sesi fun games yang dipandu fasilitator kami.
>
> Aula dan area parkir sudah termasuk, begitu juga dokumentasi kegiatan. Susunan
> acaranya bisa disesuaikan kalau tim kamu punya agenda sendiri.

**Susunan acara:** Welcome & registrasi di CampX → Ice breaking & pembagian
kelompok → Berlayar ke kaki Tebing Boyer → Safety briefing & mulai hiking →
Puncak Boyer: foto & istirahat → Kembali ke CampX → Makan siang & istirahat →
Sesi fun games & team building → Penutupan

### 6.12 Outing Boyer Hill 2D1N

| Slot | Teks |
|---|---|
| Judul | Outing Boyer Hill 2D1N |
| Subjudul | Dua hari satu malam, ditutup api unggun |
| Ringkasan | Semua isi paket sehari, ditambah menginap di tenda, makan malam, api unggun, dan sesi games pagi. |
| Badge | Paling lengkap |
| Harga | Rp749.000 /orang, minimal 20 orang |

**Deskripsi:**

> Versi panjang dari Boyer Hill Summit Challenge. Hari pertama berisi perahu,
> hiking, dan makan siang. Malamnya lanjut ramah tamah di depan api unggun.
>
> Pagi kedua ada sesi fun games dan kompetisi tim sebelum pulang. Ini paket yang
> dipilih tim yang memang niat mengakrabkan orang, bukan sekadar jalan-jalan.

**Hari pertama:** Tiba di CampX, welcome drink & registrasi → Ice breaking &
pembagian tim → Berlayar & hiking ke Puncak Boyer → Kembali ke CampX & makan
siang → Check-in tenda & waktu bebas → Makan malam & ramah tamah → Api unggun &
malam keakraban → Istirahat

**Hari kedua:** Sunrise & sarapan → Fun games & kompetisi tim → Waktu bebas →
Persiapan pulang & check-out

---

## 7. Paket CampX Cikidang

### 7.1 Saung Rumbia

| Slot | Teks |
|---|---|
| Judul | Saung Rumbia |
| Subjudul | Cabin A-frame beratap rumbia dengan deck kayu |
| Ringkasan | Cabin tertutup untuk dua orang, sudah termasuk tempat tidur, kipas, listrik, air, dan set meja kursi di deck depan. |
| Badge | Baru |
| Harga | Weekday Rp350.000, weekend Rp450.000 /malam. Tambahan 1 orang + extra bed Rp120.000 |
| Catatan | Harga per unit, sudah termasuk tiket masuk untuk 2 orang. |

**Deskripsi:**

> Saung Rumbia adalah cabin berbentuk A-frame dengan atap rumbia dan deck kayu di
> depannya. Isinya dua tempat tidur, exhaust fan, dan set meja kursi untuk
> duduk-duduk di luar.
>
> Harga sudah termasuk tiket masuk untuk dua orang, listrik, dan air bersih. Kalau
> datang lebih dari berdua, ada biaya tambahan per orang yang sudah termasuk extra
> bed.

### 7.2 Tentsite

| Slot | Teks |
|---|---|
| Judul | Tentsite |
| Subjudul | Sewa lahan camping, bawa tenda sendiri |
| Ringkasan | Lahan camping di Middle Point atau Riverside, sudah termasuk tiket masuk dua orang, air, dan listrik. |
| Harga | Weekday Rp250.000, weekend Rp350.000 /malam. Tambahan orang Rp75.000 |

**Deskripsi:**

> Kamu menyewa lahannya, tendanya bawa sendiri. Ada dua area yang bisa dipilih:
> Middle Point yang datar dan teduh, atau Riverside yang menempel ke sungai.
>
> Harga sudah termasuk tiket masuk untuk dua orang, air bersih, dan listrik. Kalau
> rombongannya lebih dari dua orang, ada biaya tambahan per orang.

### 7.3 Lima jalur rafting

Semua jalur memakai daftar "termasuk" yang sama: perlengkapan arung jeram
lengkap, tim rescue, asuransi peserta, pemandu sungai, transportasi lokal ke
titik start. Titik kumpulnya juga sama: Lobby & resepsionis CampX Cikidang.

| Paket | Subjudul | Harga | Badge |
|---|---|---|---|
| Rafting Baby Salamander | Jalur khusus anak usia 5 sampai 9 tahun | Rp220.000 /orang | Ramah anak |
| Rafting Salamander | 5 kilometer, sekitar 1 jam | Rp255.000 /orang | Cocok buat pemula |
| Rafting Aligator | 9 kilometer, sekitar 2 jam | Rp325.000 /orang | - |
| Rafting Crocodile | 13 kilometer, sekitar 3 jam | Rp410.000 /orang | Favorit rombongan |
| Rafting Grand Crocodile | 17 kilometer, sekitar 5 jam | Rp550.000 /orang | Jalur terpanjang |

**Baby Salamander.** Ringkasan: Jalur pendek dan tenang yang dirancang untuk
anak-anak, dengan pemandu dan tim rescue yang sama.

> Ini jalur arung jeram khusus untuk anak usia 5 sampai 9 tahun. Arusnya dipilih
> yang paling aman, tapi perlengkapan, pemandu, tim rescue, dan asuransinya sama
> persis dengan paket dewasa.
>
> Banyak keluarga mengambil ini bersamaan dengan paket dewasa, jadi anak dan orang
> tuanya sama-sama turun ke sungai di hari yang sama.

**Salamander.** Ringkasan: Jalur terpendek dan paling ramah pemula. Satu perahu
isi empat orang, sekitar satu jam di sungai.

> Salamander jalur paling pendek di Sungai Citarik: 5 kilometer, kira-kira satu
> jam. Ini yang kami sarankan kalau kamu baru pertama kali arung jeram atau datang
> bersama orang yang belum pernah.
>
> Satu perahu diisi empat orang plus pemandu. Perlengkapan, tim rescue, asuransi,
> dan transportasi lokal ke titik start sudah termasuk.

**Aligator.** Ringkasan: Dua kali lipat jalur Salamander. Cocok kalau sudah pernah
rafting dan ingin lebih lama di sungai.

> Aligator menempuh 9 kilometer Sungai Citarik dalam sekitar dua jam. Jeramnya
> lebih banyak dan jeda di antara jeramnya lebih pendek, jadi terasa lebih ramai
> daripada Salamander.
>
> Satu perahu isi empat orang plus pemandu. Semua perlengkapan, tim rescue,
> asuransi, dan transportasi lokal sudah termasuk.

**Crocodile.** Ringkasan: Jalur panjang untuk rombongan. Kapasitas sampai 10
orang, tiga jam menyusuri sungai.

> Crocodile menempuh 13 kilometer Sungai Citarik dalam sekitar tiga jam.
> Kapasitasnya sampai 10 orang, jadi ini yang paling sering diambil rombongan
> kantor dan komunitas.
>
> Karena jalurnya panjang, sebaiknya sarapan dulu sebelum berangkat. Perlengkapan,
> tim rescue, asuransi, pemandu, dan transportasi lokal sudah termasuk.

**Grand Crocodile.** Ringkasan: Jalur terpanjang di CampX Cikidang. Lima jam di
sungai, untuk yang memang mencari tantangan.

> Ini jalur terpanjang yang kami buka di Sungai Citarik: 17 kilometer, sekitar
> lima jam. Bukan untuk yang baru pertama kali.
>
> Kapasitasnya sampai 10 orang. Perlengkapan, tim rescue, asuransi, pemandu, dan
> transportasi lokal sudah termasuk. Siapkan stamina dan baju ganti yang cukup.

### 7.4 Aktivitas darat

| Paket | Subjudul | Harga | Minimal |
|---|---|---|---|
| Flying Fox | Meluncur melintasi sungai | Rp70.000 /orang | 5 orang |
| ATV | Keliling jalur tanah di sekitar area | Rp70.000 /orang | 5 orang |
| Trekking | 13 kilometer menembus kebun dan kampung | Rp150.000 /orang | 5 orang |
| Paintball | Lapangan khusus, perlengkapan lengkap | Rp125.000 /orang | 10 orang |

**Flying Fox.** Ringkasan: Luncuran seling yang melintas di atas sungai. Minimal 5
orang, perlengkapan dan asuransi termasuk.

> Flying fox di sini melintas persis di atas sungai, jadi pemandangannya bukan
> cuma pepohonan. Perlengkapan outdoor, asuransi, dan pemandu sudah termasuk.
>
> Dibuka untuk minimal 5 orang, jadi paling enak diambil bareng teman atau
> rombongan.

**ATV.** Ringkasan: Kendarai ATV menyusuri jalur tanah di sekitar campground.
Minimal 5 orang.

> Jalur ATV di sini melewati tanah, tanjakan pendek, dan sisi kebun di sekitar
> area. Perlengkapan outdoor, asuransi, dan pemandu sudah termasuk.
>
> Dibuka untuk minimal 5 orang. Sering dirangkai dengan flying fox dan paintball
> jadi satu rangkaian setengah hari.

**Trekking.** Ringkasan: Jalan kaki 13 kilometer sekitar tiga jam dengan pemandu,
snack, dan transportasi lokal.

> Rute trekking sepanjang 13 kilometer ini melewati kebun, jalan kampung, dan sisi
> sungai. Waktunya sekitar tiga jam, tergantung kecepatan rombongan.
>
> Snack, pemandu, dan transportasi lokal sudah termasuk. Dibuka untuk minimal 5
> orang.

**Paintball.** Ringkasan: Seragam, google, senjata Tippmann Pro-Lite, dan 30
peluru per orang. Minimal 10 orang.

> Paintball di lapangan khusus dengan rintangan. Setiap peserta dapat seragam,
> google pelindung, senjata Tippmann Pro-Lite, dan 30 peluru.
>
> Dibuka untuk minimal 10 orang, jadi ini memang dirancang untuk rombongan.
> Perlengkapan outdoor, asuransi, dan pemandu sudah termasuk.

### 7.5 One Day Trip Geopark Ciletuh

| Slot | Teks |
|---|---|
| Judul | One Day Trip Geopark Ciletuh |
| Subjudul | Pelabuhan Ratu, dua curug, dan pantai dalam sehari |
| Ringkasan | Berangkat setengah delapan pagi dari CampX Cikidang, keliling Geopark Ciletuh, kembali sore hari. |
| Harga | Mulai Rp550.000 /orang |
| Catatan | Harga menyesuaikan jumlah peserta dan titik jemput. |

**Deskripsi:**

> Trip sehari keluar area menuju Geopark Ciletuh, kawasan geopark UNESCO di
> selatan Sukabumi. Rutenya mampir ke Pelabuhan Ratu, Curug Cimarinjung, Curug
> Sodong, lalu ditutup di Pantai Palangpang atau Puncak Aher untuk melihat
> matahari sore.
>
> Berangkat pukul 07.30 dari CampX Cikidang dan kembali sekitar pukul 17.00. Harga
> menyesuaikan jumlah peserta, jadi kabari dulu rombonganmu berapa orang.

**Jadwal:** 07.30 Kumpul di CampX Cikidang · 08.00 Perjalanan menuju Pelabuhan
Ratu · 09.00 Pemberhentian pertama: Pelabuhan Ratu · 09.45 Perjalanan ke Curug
Cimarinjung · 11.00 Pemberhentian kedua: Curug Cimarinjung · 12.00 Perjalanan ke
Curug Sodong · 12.15 Pemberhentian ketiga: Curug Sodong · 13.00 Makan siang ·
14.00 Pantai Palangpang atau Puncak Aher · 15.30 Kembali ke CampX Cikidang ·
17.00 Trip selesai

---

## 8. Halaman outing (`/outing`)

| Slot | Teks |
|---|---|
| Title | Paket Outing Kantor & Team Building |
| Description | Outing, gathering, dan team building di dua lokasi: tepi Waduk Jatiluhur dan tepi sungai Cikidang. Susunan acara dan penawaran menyesuaikan tim kamu. |
| Eyebrow | Untuk perusahaan, komunitas, dan sekolah |
| H1 | Paket outing kantor dan team building di dua lokasi |
| Sub | Kami menyusun acaranya, memandu jalannya, dan mengirim dokumentasinya. Kamu tinggal bawa timnya. Pilih danau yang tenang di Purwakarta, atau sungai berarus di Sukabumi. |
| CTA utama | Minta penawaran |
| CTA kedua | Diskusi lewat WhatsApp |

**Angka di bawah hero:** Lokasi 2 · Kavling camping 112 · Amfiteater 200 orang ·
Paket & aktivitas 24

**Section:**

| Judul | Deskripsi |
|---|---|
| Dua lokasi, dua karakter | (kartu per cabang) |
| Paket yang sudah jadi | Tiga rangkaian yang paling sering diambil. Susunan acaranya masih bisa digeser sesuai kebutuhan tim kamu. |
| Rangkai sendiri | Semua aktivitas di bawah bisa dikombinasikan jadi setengah hari, sehari penuh, atau dua hari satu malam. Angka minimal peserta menentukan mana yang bisa jalan. |
| Contoh susunan acara | Diambil dari [nama paket]. Ini gambaran ritmenya, bukan jadwal mati. |
| Cara kerjanya | (empat langkah) |
| Pertanyaan soal outing | (accordion FAQ) |

**Empat langkah cara kerja:**

| Langkah | Judul | Isi |
|---|---|---|
| 1 | Cerita dulu | Jumlah peserta, tanggal, dan tujuan acaranya. Satu pesan WhatsApp sudah cukup untuk mulai. |
| 2 | Kami susun acaranya | Kami kirim susunan acara dan penawaran yang menyesuaikan lokasi, durasi, dan anggaran. |
| 3 | Survei kalau perlu | Untuk rombongan besar, tim kamu bisa datang lebih dulu melihat lokasinya langsung. |
| 4 | Hari-H | Fasilitator kami memandu jalannya acara, dan dokumentasinya kami kirim setelahnya. |

**Formulir:**

| Slot | Teks |
|---|---|
| Judul | Ceritakan rencana outing kamu |
| Deskripsi | Sebutkan jumlah peserta, tanggal, dan lokasi yang diminati. Tim kami balas dengan susunan acara dan penawarannya. |
| Label perusahaan | Nama perusahaan |
| Tombol kirim | Kirim permintaan |

---

## 9. Halaman detail paket

Urutan section dan label tetapnya.

| Slot | Teks |
|---|---|
| Breadcrumb | Beranda → [Nama cabang] → [Nama paket] |
| Tombol galeri | Lihat semua foto |
| Tombol bagikan | Bagikan |
| Fakta cepat | Durasi · Kapasitas · Minimal peserta · Usia · Jarak · Titik kumpul |
| Section deskripsi | Tentang paket ini |
| Section termasuk | Yang kamu dapat |
| Section belum termasuk | Belum termasuk |
| Section itinerary | Susunan acara |
| Section harga | Rincian harga |
| Section syarat | Yang perlu kamu tahu |
| Section terkait | Paket lain di sini |
| Panel booking | Reservasi lewat WhatsApp |
| Baris OTA | Atau pesan lewat |
| Catatan booking online | Booking langsung di web lagi kami siapkan. |
| Status perawatan | Wahana ini lagi perawatan. Tinggalkan pesan lewat WhatsApp, nanti kami kabari begitu buka lagi. |

**Format harga:** "Mulai" hanya muncul kalau tiernya lebih dari satu. Menulis
"mulai dari" di atas harga tunggal bikin angka pasti kelihatan seperti perkiraan.

---

## 10. FAQ

Dua puluh tiga pertanyaan. Kurung di belakang tiap pertanyaan menentukan halaman
mana yang boleh merender pertanyaan itu. Sepuluh di antaranya tampil di beranda.

### Umum

**Gimana cara pesannya?** (beranda, FAQ, halaman paket)

> Paling cepat lewat WhatsApp. Klik tombol pesan di halaman paket yang kamu mau,
> pesannya sudah terisi otomatis dengan nama paket dan cabangnya, tinggal kirim.
>
> Khusus paket menginap di Jatiluhur, kamu juga bisa pesan lewat Agoda, Traveloka,
> tiket.com, atau Trip.com.

**Bisa bayar di tempat?** (FAQ)

> Reservasinya tetap harus dikonfirmasi dulu lewat WhatsApp, supaya kavling atau
> jadwal aktivitasmu tidak keburu diambil orang lain. Soal cara bayarnya, tim kami
> yang jelaskan waktu konfirmasi, karena bisa berbeda tergantung paket dan
> tanggalnya.

**Apa bedanya Jatiluhur dan Cikidang?** (beranda, FAQ)

> Jatiluhur di Purwakarta, di tepi Waduk Jatiluhur. Suasananya danau yang tenang,
> dan aktivitasnya di atas air: paddle board, perahu, memancing, jetski.
>
> Cikidang di Sukabumi, di tepi Sungai Citarik. Menu utamanya arung jeram, ditambah
> flying fox, ATV, trekking, dan paintball.
>
> Dua-duanya bisa untuk menginap dan untuk outing rombongan. Kalau timmu mau yang
> santai, ambil Jatiluhur. Kalau mau yang memacu adrenalin, Cikidang.

**Berapa lama dari Jakarta?** (beranda, FAQ, halaman cabang)

> Jatiluhur sekitar dua jam lewat Tol Cipularang, keluar di gerbang Jatiluhur.
> Cikidang lebih jauh, tiga sampai empat jam lewat Tol Bocimi, dan bisa molor
> kalau kebetulan akhir pekan panjang.
>
> Dari Bandung, Jatiluhur cuma satu setengah jam. Dari Bogor, Cikidang sekitar
> dua setengah jam.

**Bisa datang tanpa menginap?** (beranda, FAQ)

> Bisa. Di Jatiluhur ada Day Trip Pass seharga Rp100.000 per orang untuk seharian
> penuh, pukul 07.00 sampai 19.00, sudah termasuk main paddle board dan sepedaan
> keliling area.
>
> Di Cikidang semua aktivitas dijual per sesi, jadi kamu bisa ambil rafting atau
> paintball saja lalu pulang sore.

**Harga weekday dan weekend beda?** (beranda, FAQ, halaman paket)

> Beda, dan selisihnya lumayan. Weekday di sini hitungannya Senin sampai Kamis,
> weekend Jumat sampai Minggu.
>
> Contohnya Cabin X di Jatiluhur: Rp175.000 per orang di weekday, Rp225.000 di
> weekend. Aktivitas seperti rafting, paintball, dan ATV harganya sama sepanjang
> minggu.

**Ada listrik dan air bersih di kavling?** (beranda, FAQ, halaman cabang)

> Ada, di dua cabang. Listrik dan air bersih sampai ke titik kavling, jadi kamu
> tidak perlu bawa jerigen atau menghemat baterai semalaman.
>
> WiFi juga menjangkau area camping di Jatiluhur. Beberapa tamu memang sengaja
> kerja dari sana.

**Ada minimal jumlah orang?** (beranda, FAQ, halaman paket)

> Tergantung paketnya. Paket menginap di Jatiluhur minimal dua orang. Aktivitas
> darat di Cikidang minimal lima orang, kecuali paintball yang minimal sepuluh.
>
> Paket outing minimal 20 peserta. Rafting dihitung per orang, satu perahu diisi
> empat, jadi kabari dulu rombonganmu berapa supaya kami siapkan perahunya.

**Perlu bawa apa kalau camping di sini?** (beranda, FAQ, halaman paket)

> Tergantung paket yang kamu ambil. Kalau ambil Camping Tenda Lengkap atau cabin,
> tenda dan matras sudah kami pasang di kavling, jadi cukup bawa baju ganti dan
> perlengkapan mandi.
>
> Kalau ambil Camping Mandiri atau tentsite, tenda, perlengkapan tidur, dan alat
> masak bawa sendiri. Yang kami sediakan lahannya, listrik, dan air bersih.

**Apa saja yang gratis untuk tamu yang menginap?** (beranda, FAQ, halaman cabang)

> Di Jatiluhur, stand-up paddle board, sepeda, dan spot mancing bebas dipakai
> tanpa biaya tambahan. Alat pancingnya saja yang bawa sendiri.
>
> Jetski, jetcar, dan sewa perahu tetap berbayar karena itu wahana terpisah.

**Aman buat anak kecil?** (beranda, FAQ)

> Aman. Banyak keluarga datang bawa anak, terutama ke Jatiluhur yang medannya
> datar dan dekat ke toilet serta kamar mandi.
>
> Untuk rafting di Cikidang ada jalur khusus umur 5 sampai 9 tahun namanya Baby
> Salamander. Di bawah lima tahun belum bisa turun ke sungai, tapi tetap bisa
> ikut menginap dan main di area.

### Jatiluhur

**Di mana persisnya CampX Jatiluhur?** (FAQ, halaman cabang)

> Di Jl. Waduk Jatiluhur, Jatimekar, Kecamatan Jatiluhur, Kabupaten Purwakarta,
> Jawa Barat 41152. Sekitar dua jam dari Jakarta lewat Tol Cipularang, keluar di
> gerbang Jatiluhur.
>
> Kalau pakai peta, cari "CampX Jatiluhur" di Google Maps atau buka titik
> lokasinya di sini.

**Jam berapa check-in dan check-out di Jatiluhur?** (FAQ, halaman cabang)

> Check-in mulai pukul 14.00 dan check-out pukul 12.00. Untuk Day Trip Pass,
> areanya buka pukul 07.00 sampai 19.00.
>
> Jam tenang berlaku mulai pukul 22.00, jadi musik dan obrolan dipelankan supaya
> tetangga kavling bisa tidur.

**Fasilitas apa saja yang ada di Jatiluhur?** (FAQ, halaman cabang)

> Toilet, kamar mandi, musholla, dapur bersama, area api unggun, dan parkir.
> Listrik dan air bersih tersedia sampai ke kavling, dan WiFi menjangkau area
> camping.
>
> Tamu yang menginap bebas memakai stand-up paddle board, sepeda, dan spot
> memancing tanpa biaya tambahan.

### Cikidang

**Di mana persisnya CampX Cikidang?** (FAQ, halaman cabang)

> Di Jl. Alternatif Cikidang - Pelabuhan Ratu RT. 5 RW. 3, Kampung Lebak Wangi,
> Cijambe, Cikiray, Kecamatan Cikidang, Kabupaten Sukabumi, Jawa Barat 43367,
> persis di tepi Sungai Citarik.
>
> Dari Jakarta kira-kira tiga sampai empat jam lewat Tol Bocimi, tergantung lalu
> lintas. Titik lokasinya bisa dibuka di Google Maps sini.

**Fasilitas apa saja yang ada di Cikidang?** (FAQ, halaman cabang)

> Lobby dan resepsionis, aula bambu terbuka untuk berkumpul, kamar mandi dan
> shower air bersih, toilet, wastafel bersama, listrik, WiFi, dan parkir.
>
> Areanya juga punya jembatan gantung menyeberang sungai dan Taman Batu yang
> biasanya jadi tempat foto paling ramai.

### Camping

**Bisa sewa peralatan camping di lokasi?** (FAQ, halaman paket)

> Di Jatiluhur bisa. Daftar dan harganya ada di PDF harga sewa peralatan. Kalau
> tidak mau repot sama sekali, ambil saja paket Camping Tenda Lengkap, semuanya
> sudah terpasang di kavling.
>
> Untuk Cikidang, tanyakan dulu lewat WhatsApp ketersediaannya di tanggal yang
> kamu mau.

### Rafting

**Belum bisa berenang, boleh ikut rafting?** (FAQ, halaman paket)

> Boleh. Pelampung dan helm wajib dipakai sepanjang perjalanan, tim rescue
> menyusuri sungai bersama rombongan, dan pemandu memberi briefing sebelum perahu
> turun.
>
> Kalau masih ragu, kabari waktu pesan. Kami arahkan ke jalur yang arusnya paling
> tenang.

**Anak umur berapa yang boleh ikut rafting?** (FAQ, halaman paket)

> Ada jalur khusus anak usia 5 sampai 9 tahun namanya Baby Salamander, dengan
> pemandu, tim rescue, dan asuransi yang sama seperti paket dewasa.
>
> Untuk jalur dewasa, sebutkan usia peserta termuda waktu pesan supaya kami bisa
> sarankan jalur yang pas.

**Apa yang perlu dibawa untuk rafting?** (FAQ, halaman paket)

> Baju ganti, alas kaki yang tidak masalah kalau basah, dan kantong plastik untuk
> baju basah. Sunblock juga membantu kalau jalurnya panjang.
>
> Barang berharga sebaiknya ditinggal, karena ponsel dan dompet tidak aman dibawa
> ke perahu.

### Outing

**Bisa untuk outing kantor atau gathering?** (FAQ, halaman outing)

> Bisa, di dua-duanya. Di Jatiluhur ada paket Boyer Hill Summit Challenge, sehari
> atau dua hari satu malam, minimal 20 peserta.
>
> Di Cikidang, rombongan biasanya merangkai rafting dengan paintball, flying fox,
> dan ATV jadi satu hari penuh, lalu berkumpul di aula.
>
> Susunan acaranya bisa disesuaikan. Cerita saja jumlah peserta, tanggal, dan
> tujuan acaranya, nanti kami buatkan penawarannya.

**Rombongan besar muat berapa orang?** (FAQ, halaman outing)

> Kapasitasnya berbeda antara akhir pekan dan hari biasa, dan tergantung kombinasi
> tenda, cabin, dan aktivitas yang diambil.
>
> Kabari jumlah peserta dan tanggalnya lewat WhatsApp, nanti kami cek
> ketersediaannya dan kirim susunan yang paling masuk.

---

## 11. Halaman pendukung

### Galeri

| Slot | Teks |
|---|---|
| Title | Galeri Foto & Video |
| Description | Suasana camping, cabin, arung jeram, dan outing di CampX Jatiluhur dan CampX Cikidang. |
| Empty state judul | Belum ada foto di sini |
| Empty state isi | Coba pilih cabang yang lain. |

### FAQ

| Slot | Teks |
|---|---|
| Title | Pertanyaan yang Sering Ditanyakan |
| Description | Cara pesan, lokasi, jam check-in, fasilitas, sampai apa yang perlu dibawa untuk rafting. Jawabannya ada di sini. |
| Judul section | Mungkin kamu nanya ini |
| Empty state | Pertanyaannya lagi kami kumpulkan. Mampir lagi nanti, ya. |
| CTA | Pertanyaanmu belum terjawab? Chat kami aja. |

### Kontak

| Slot | Teks |
|---|---|
| Title | Kontak & Reservasi |
| Description | Mau reservasi, tanya paket, atau minta penawaran outing? Hubungi tim CampX lewat WhatsApp, email, atau formulir di halaman ini. |
| Judul form | Kontak & reservasi |
| Deskripsi form | Mau reservasi, tanya paket, atau minta penawaran outing? Tinggalkan kontakmu di sini, tim kami yang akan menghubungi. |
| Tombol peta | Buka di Maps |
| Tombol cabang | Lihat cabang ini |

### Tentang

| Slot | Teks |
|---|---|
| Title | Tentang CampX Holiday Park |
| Description | CampX mengelola dua holiday park di Jawa Barat: Jatiluhur di Purwakarta dan Cikidang di Sukabumi. Ini cerita dan cara kerjanya. |
| H1 | Tentang CampX Holiday Park |
| Sub | Kami mengelola dua holiday park di Jawa Barat. Satu di tepi Waduk Jatiluhur, Purwakarta. Satu lagi di tepi Sungai Citarik, Cikidang, Sukabumi. |

**Tiga paragraf:**

> Banyak orang ingin camping tapi berhenti di urusan alat: tidak punya tenda,
> tidak tahu cara memasangnya, tidak yakin ada air bersih di lokasi. Jadi kami
> membalik urutannya. Perlengkapan sudah ada di tempat, listrik dan air sampai ke
> kavling, dan kalau mau lebih nyaman lagi ada cabin yang tinggal ditempati.
>
> Pemandangannya tetap yang utama. Itu sebabnya kavling di Jatiluhur menghadap
> air, bukan menghadap tenda tetangga. Di Cikidang, area campground yang paling
> dicari adalah yang paling dekat sungai, karena suara airnya terdengar semalaman.
>
> Untuk perusahaan, kami menyiapkan susunan acaranya dan menurunkan fasilitator
> yang memandu. Rombongan yang datang biasanya punya target sendiri, entah
> mengakrabkan tim baru atau menutup kuartal, dan susunan acaranya kami sesuaikan
> dengan target itu.

Section lain: "Diliput media" dan "Badan usaha".

### Syarat & Ketentuan, Kebijakan Privasi

| Slot | Teks |
|---|---|
| URL | `/syarat-ketentuan`, `/kebijakan-privasi` |
| Label di footer | Syarat & Ketentuan, Kebijakan Privasi |
| Title | Terms of Service, Privacy Policy |
| Description (ToS) | Syarat dan ketentuan penggunaan layanan serta website CampX Holiday Park. |
| Description (Privasi) | Cara CampX Holiday Park mengumpulkan, memakai, dan melindungi data pribadi kamu. |

Isi kedua halaman ini masih boilerplate berbahasa Inggris, sementara seluruh
situs berbahasa Indonesia. Menerjemahkannya keputusan legal, bukan copywriting,
jadi tidak saya sentuh. Kalau memang mau diterjemahkan, itu pekerjaan terpisah
yang perlu dicek ulang isinya.

### Dialog kontak (dipanggil dari tombol mana pun)

| Slot | Teks |
|---|---|
| Judul | Tanya dulu boleh |
| Deskripsi | Mau tahu isi paket outing, atau mau susun acara sendiri? Tinggalkan kontakmu di sini, tim kami yang menghubungi. |
| Tombol | Kirim |

### Blog

| Slot | Teks |
|---|---|
| Judul slider | Cerita dari lapangan |
| Tombol | Baca yang lain |

---

## 12. Label yang dipakai berulang

**Tombol:** Lihat semua paket · Lihat semua · Lihat detail · Reservasi ·
Reservasi lewat WhatsApp · Minta penawaran · Lihat paket outing · Buka di Maps ·
Lihat cabang ini · Baca yang lain · Reset filter · Filter · Kirim permintaan

**Badge paket:** Cocok buat pertama kali · Paling banyak diambil · Favorit
pasangan · Paling lengkap · Baru · Ramah anak · Cocok buat pemula · Favorit
rombongan · Jalur terpanjang

**Badge lokasi:** Baru · Baru dibuka

**Label fakta:** Mulai dari · Dari Jakarta · Paket tersedia · Kavling camping ·
Lahan camper van · Open stage amfiteater · Durasi · Kapasitas · Titik kumpul

**Kategori:** Camping · Cabin · Day trip · Rafting · Aktivitas air · Aktivitas
darat · Trip · Outing · Team building

**Deskripsi kategori:**

| Kategori | Deskripsi |
|---|---|
| Camping | Menginap di tenda, bawa sendiri atau tinggal datang. |
| Cabin | Bangunan tertutup dengan kasur, buat yang mau nyaman tanpa repot. |
| Day trip | Datang pagi, pulang sore. Tanpa menginap. |
| Rafting | Arung jeram dengan pemandu, tim rescue, dan asuransi. |
| Aktivitas air | Semua yang dilakukan di atas air. |
| Aktivitas darat | Adrenalin dan permainan di darat. |
| Trip | Perjalanan keluar area dengan rute dan jadwal tetap. |
| Outing | Paket rombongan untuk kantor, komunitas, dan sekolah. |
| Team building | Sesi terpandu untuk mengakrabkan tim. |

**Fasilitas:** Toilet · Kamar mandi · Shower air bersih · Air bersih · Listrik di
kavling · Area parkir · Musholla · WiFi · Area api unggun · Dapur bersama · Tenda
sudah terpasang · Kasur & bantal · Set meja & kursi · Cafe & restoran · Warung ·
Lobby & resepsionis · Bantuan 24 jam · Keamanan area · Kotak P3K · Dokumentasi
kegiatan · Sound system · Aula terbuka · Spot foto · Dermaga perahu · Jembatan
gantung · Akses sungai · Akses danau · Meeting room · Open stage amfiteater ·
Welcome area · Lapangan team building

---

## 13. Keyword yang harus muncul

Bukan untuk ditempel, tapi untuk dipastikan ada tempatnya di layout. Kalau
sebuah keyword tidak muat di desain, halamannya kehilangan alasan untuk peringkat.

| Klaster | Keyword | Halaman pemilik |
|---|---|---|
| Jatiluhur | camping jatiluhur, glamping jatiluhur, camping purwakarta, wisata waduk jatiluhur, tempat camping dekat jakarta | `/jatiluhur` |
| Aktivitas air | jetski jatiluhur, sup jatiluhur, mancing jatiluhur, sewa perahu jatiluhur | halaman paket masing-masing |
| Cikidang | rafting citarik, arung jeram citarik, paket rafting citarik, rafting sukabumi, camping cikidang | `/cikidang` |
| Aktivitas darat | paintball sukabumi, atv sukabumi, flying fox sukabumi, trekking sukabumi | halaman paket masing-masing |
| Day trip | one day trip geopark ciletuh, curug cimarinjung, curug sodong | `/cikidang/day-trip-geopark-ciletuh` |
| Korporat | paket outing kantor, outing perusahaan, team building jawa barat, outbound dekat jakarta | `/outing` |
| Merek | campx, campx jatiluhur, campx cikidang, campx holiday park | `/` dan halaman cabang |

---

## 14. Yang belum bisa ditulis

Empat hal ini sengaja tidak muncul di mana pun karena belum ada sumbernya. Kalau
desain butuh slot untuk salah satunya, datanya harus dikonfirmasi dulu.

**Jam check-in Cikidang.** Jatiluhur punya (14.00 / 12.00), Cikidang belum
pernah dipublikasikan.

**Kapasitas Cikidang.** Berapa kavling, berapa cabin, aula muat berapa orang.
Angka untuk Jatiluhur diambil dari venue guide resmi; Cikidang belum punya.

**Tiket masuk harian.** Tidak ada di daftar harga mana pun.

**Paket tenda Cikidang.** Foto "Tenda Kapasitas 2" dan "Tenda Kapasitas 4" jelas
menunjukkan tenda sudah terpasang lengkap dengan kasur dan selimut, tapi
produknya tidak ada di daftar harga 2026. Ini justru produk terlaris di
Jatiluhur, jadi sayang kalau hilang di Cikidang. Fotonya sudah siap di
`/img/cikidang/tenda-2` dan `/img/cikidang/tenda-4`, tinggal harganya.

**Rating yang hidup.** Angka Google dan TikTok sudah dicabut dari hero karena
disalin manual dan tidak pernah berubah. Kalau nanti ada cara menariknya secara
otomatis, dua syarat tetap berlaku: sebutkan sumbernya di sebelah angkanya, dan
jangan pernah tandai sebagai `aggregateRating` di structured data. Itu ulasan
pihak ketiga, bukan yang dikumpulkan di campx.id, dan mengklaimnya melanggar
kebijakan review snippet Google.
