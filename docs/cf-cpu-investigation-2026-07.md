# Investigasi Lonjakan Workers CPU — Juli 2026

Akun Cloudflare: `Nextifier@gmail.com` (`3797ae01f7dfb6dffb5a1b3f82713c33`)
Tanggal analisa: 23 Juli 2026
Sumber data: Cloudflare GraphQL Analytics API (`workersOverviewRequestsAdaptiveGroups`,
`workersInvocationsAdaptive`, `httpRequestsAdaptiveGroups`) + `/api/v4/accounts/{id}/paygo-usage`.

---

## 1. Laporan billing per siklus

Siklus billing: tanggal 22 → 21 bulan berikutnya. Kuota included paket Workers Paid ($5):
**30.000.000 ms CPU** + **10.000.000 requests**. Kelebihan: $0,02 / juta ms CPU, $0,30 / juta request.

### 6 siklus terakhir (yang ditanyakan)

| Siklus penggunaan | Invoice | Total Requests | Total CPU (ms) | CPU billable | Biaya usage |
|---|---|---:|---:|---:|---:|
| 22 Jan – 22 Feb 2026 | 22 Feb · $5,00 | 71.418 | 1.574.891 | 0 | $0,00 |
| 22 Feb – 22 Mar 2026 | 22 Mar · $5,00 | n/a¹ | n/a¹ | 0 | $0,00 |
| 22 Mar – 22 Apr 2026 | 22 Apr · $5,00 | n/a¹ | n/a¹ | 0 | $0,00 |
| 22 Apr – 22 Mei 2026 | 22 Mei · $5,00 | n/a¹ | n/a¹ | 0 | $0,00 |
| 22 Mei – 22 Jun 2026 | 22 Jun · $5,00 | n/a¹ | n/a¹ | 0 | $0,00 |
| **22 Jun – 22 Jul 2026** | **22 Jul · $12,52** | **11.669.408** | **373.604.916** | **345.137.835** | **$7,52** (CPU $6,92 + request $0,60) |
| 22 Jul – 22 Ags 2026 (berjalan, 1 hari) | — | ±87.500 | ±12.700.000 | — | proyeksi ±$7,4 |

¹ Endpoint `paygo-usage` tidak mengembalikan baris apa pun untuk 4 siklus itu (termasuk R2 &
Images yang seharusnya selalu ada) → **gap data di API, bukan nol**. Yang pasti: invoice-nya
$5,00 flat, artinya CPU tetap di bawah 30M ms dan request di bawah 10M.

### Konteks lebih lama (data tersedia lengkap)

| Siklus penggunaan | Invoice | Total Requests | Total CPU (ms) | CPU billable | Biaya CPU |
|---|---|---:|---:|---:|---:|
| 22 Jul – 22 Ags 2025 | 22 Ags · $5,94 | 2.360.404 | 76.771.997 | 46.771.997 | $0,94 |
| 22 Ags – 22 Sep 2025 | 22 Sep · $5,48 | 2.440.200 | 53.624.725 | 23.624.725 | $0,48 |
| 22 Sep – 22 Okt 2025 | 22 Okt · $5,00 | 1.700.983 | 21.793.982 | 0 | $0,00 |
| 22 Okt – 22 Nov 2025 | 22 Nov · $5,00 | 302.070 | 3.766.340 | 0 | $0,00 |
| 22 Nov – 22 Des 2025 | 22 Des · $5,00 | 141.288 | 2.438.799 | 0 | $0,00 |
| 22 Des – 22 Jan 2026 | 22 Jan · $5,00 | 112.974 | 4.210.934 | 0 | $0,00 |

**Skala lonjakan:** 373,6M ms vs 1,57M ms di siklus Januari → **238× lipat**.
Dibanding puncak sebelumnya (76,8M ms, Jul 2025) → **4,9× lipat**.

---

## 2. Kapan mulai melonjak

Harian, siklus 22 Jun – 21 Jul 2026 (ms CPU / requests):

| Tanggal | CPU (M ms) | Requests | ms/req |
|---|---:|---:|---:|
| 23 Jun | 2,24 | 94.155 | 24 |
| **24 Jun** | **12,07** | **841.001** | 14 |
| 25 Jun | 13,00 | 940.490 | 14 |
| 26 Jun | 13,40 | 869.849 | 15 |
| 27 Jun | 12,47 | 885.112 | 14 |
| 28 Jun | 11,81 | 890.187 | 13 |
| 29 Jun | 13,72 | 999.204 | 14 |
| 30 Jun | 11,55 | 898.677 | 13 |
| 1 Jul | 11,49 | 802.703 | 14 |
| 2 Jul | 11,16 | 858.164 | 13 |
| 3 Jul | 12,10 | 579.701 | 21 |
| **4 Jul** | 11,86 | **175.460** | 68 |
| 5 Jul | 12,49 | 173.353 | 72 |
| 6 Jul | 14,65 | 206.272 | 71 |
| 7 Jul | 13,47 | 211.720 | 64 |
| 8 Jul | 13,55 | 208.676 | 65 |
| 9 Jul | 12,92 | 160.647 | 80 |
| 10 Jul | 11,35 | 143.676 | 79 |
| 11 Jul | 11,02 | 158.036 | 70 |
| 12 Jul | 12,83 | 158.557 | 81 |
| 13 Jul | 16,86 | 180.781 | 93 |
| 14 Jul | 17,31 | 186.661 | 93 |
| 15 Jul | 15,92 | 159.678 | 100 |
| 16 Jul | 13,60 | 136.737 | 99 |
| 17 Jul | 14,58 | 153.797 | 95 |
| 18 Jul | 12,72 | 150.439 | 85 |
| 19 Jul | 11,14 | 148.754 | 75 |
| 20 Jul | 14,19 | 168.449 | 84 |
| **21 Jul** | **18,11** | 128.472 | **141** |
| 22 Jul | 12,72 | 87.499 | 145 |

Tiga titik belok:

1. **24 Jun** — CPU naik 2,2M → 12,1M ms/hari, request 94k → 841k. Titik awal masalah.
   Penyebab paling konsisten dengan data: `_routes.json` hasil preset `cloudflare-pages`
   terpotong di batas 100 rule (didokumentasikan sendiri di `layers/base/modules/cf-cache.ts`),
   sehingga file statis ikut memanggil Pages Function.
2. **4 Jul** — request turun 580k → 175k (modul `cf-cache` + wildcard `_routes.json`
   di-deploy 3–4 Jul). **Requests turun 5×, tapi CPU tidak bergerak sama sekali** —
   bukti bahwa invocation yang dihilangkan itu yang murah (14 ms), sedangkan CPU
   sebenarnya selalu dari SSR halaman.
3. **21 Jul** — migrasi preset `cloudflare-pages` → `cloudflare_module`
   (commit `4e91d3c` + `db60b74`). CPU/request naik 84 ms → 145 ms, CPU harian
   naik ke 18,1M. Ini mematikan sisa cache edge yang masih bekerja (lihat §3).

---

## 3. Penyebab utama: HTML SSR tidak pernah masuk cache edge

Diverifikasi langsung dengan `curl`:

```
$ curl -I https://indonesiacomiccon.com/favicon.ico
cf-cache-status: HIT            ← static asset: dilayani Static Assets, worker TIDAK jalan

$ curl -I https://indonesiacomiccon.com/id/news/urutan-film-marvel
cache-control: public, max-age=0, s-maxage=300
set-cookie: i18n_locale=id; ...
(TIDAK ADA header cf-cache-status)   ← response worker, tidak pernah masuk cache CF
```

Cache Rule `respect-origin-cache-control` **ada** di zone (dibuat 8 Jul, terverifikasi via
API ruleset), header `s-maxage` **ada** di response. Tapi tidak berpengaruh, karena:

- Dalam urutan trafik Cloudflare, **Worker berjalan SEBELUM cache**. Cache Rule hanya
  mengatur cache untuk `fetch()` subrequest, bukan untuk response yang dihasilkan Worker.
- Nuxt me-render HTML di dalam worker (tidak ada origin fetch), jadi tidak ada apa pun
  yang bisa di-cache oleh Cache Rule.
- Waktu masih preset `cloudflare-pages`, project Pages diperlakukan seperti origin sehingga
  Cache Rule masih bekerja (log 14 Jul: `/news` HIT, cache rate 53%). Setelah 21 Jul, hilang.
- Tambahan: setiap response HTML mengirim `set-cookie: i18n_locale` → response ber-`Set-Cookie`
  tidak akan pernah di-cache CDN mana pun.

**Akibatnya: 1 request halaman = 1 invocation + 1 full SSR, tanpa kecuali.**

### Biaya per render sangat mahal

| Halaman | Ukuran HTML | `__NUXT_DATA__` | Inline SVG | Inline script |
|---|---:|---:|---:|---:|
| `/id` (home ICC) | 340 KB | 98 KB | 93 KB (31 svg) | 109 KB |
| `/id/news/urutan-film-marvel` | 234 KB | 65 KB | 87 KB (13 svg) | 70 KB |

CPU rata-rata per invocation, 24 jam terakhir (data `workersInvocationsAdaptive`):

| Worker | Requests | CPU total | ms/req |
|---|---:|---:|---:|
| icc | 20.850 | 2.396 s | 115 |
| flei | 10.783 | 1.759 s | 163 |
| megabuild | 9.651 | 1.654 s | 171 |
| morefood | 7.697 | 1.443 s | 187 |
| cafeexpo | 9.819 | 1.241 s | 126 |
| inacon | 6.844 | 1.159 s | 169 |
| icf | 5.805 | 981 s | 169 |
| cokelatexpo | 7.603 | 969 s | 128 |
| keramika | 6.883 | 964 s | 140 |
| panorama-events | 4.237 | 712 s | 168 |
| panorama-media | 7.274 | 695 s | 96 |
| iicc | 3.199 | 616 s | 193 |
| outingexpo | 2.981 | 613 s | 206 |
| renex | 2.174 | 432 s | 198 |
| pmone | 2.229 | 214 s | 96 |
| campx | 2.851 | 163 s | 57 |
| global-ai-expo | 440 | 42 s | 96 |
| levenium | 437 | 21 s | 48 |
| levenium-ui | 279 | 15 s | 54 |
| monara | 198 | 10 s | 52 |
| **Total** | **112.234** | **16.100 s** | **143** |

Kuota gratis 30M ms/bulan = **1M ms/hari**. Realisasi 12–18M ms/hari → **12–18× di atas kuota**.

---

## 4. Komposisi request yang memanggil Worker (24 jam, semua zone)

Request dengan `cacheStatus` bukan `hit` (yaitu yang sampai ke worker), host `api.*` dikecualikan:

| Kategori | Jumlah/hari | % | Catatan |
|---|---:|---:|---|
| HTML SSR | 22.372 | 23,2% | Sumber CPU utama (±150–350 ms/render) |
| Bot scan 404 (`/wp-admin`, `/wp-login.php`, `/wp-json`, `.php`, `.env`) | 18.640 | 19,3% | Murni sampah, bisa 0 |
| `/api/_nuxt_icon/*.json` | 12.966 | 13,4% | Trafik sah (lihat koreksi di bawah tabel) — serap dengan Cache API |
| `/cdn-cgi/rum` | 11.069 | 11,5% | Beacon Web Analytics, tidak memanggil worker |
| `/_nuxt/*` uncached | 9.211 | 9,5% | |
| File statis lain (`robots.txt`, `sitemap`, ikon) | 7.386 | 7,6% | |
| HTML redirect i18n (301/302/307) | 5.139 | 5,3% | `alwaysRedirect: true` → tiap kunjungan `/` = 2 invocation |
| API aplikasi | 4.364 | 4,5% | |
| `/_nuxt/*` 404/redirect | 3.103 | 3,2% | HTML/service-worker basi menunjuk chunk lama |
| HTML error | 2.376 | 2,5% | |

Halaman paling panas (24 jam):

```
3.975  indonesiacomiccon.com/id/news/urutan-film-marvel
2.290  indonesiacomiccon.com/api/_nuxt_icon/ri.json
2.000  indonesiacomiccon.com/api/_nuxt_icon/lucide.json
1.753  indonesiacomiccon.com/api/_nuxt_icon/hugeicons.json
1.166  franchise-expo.co.id/id/book-space        [307]
1.149  franchise-expo.co.id/
1.019  iicc.askindo.id/
1.009  www.franchise-expo.co.id/                 [301]
  842  panoramaevents.id/news/urutan-nonton-konosuba
```

`/id/news/urutan-film-marvel` sendirian = 3.975 render penuh/hari ≈ **1,2M ms CPU/hari**
(lebih dari seluruh kuota gratis harian) untuk **satu URL dengan isi yang sama persis**.

---

## 5. Rencana perbaikan

Target: ≤ 30M ms/bulan = **≤ 1M ms/hari**. Sekarang 12–18M ms/hari → butuh pengurangan **≥ 93%**.

### P0-A — Cache HTML/API di dalam Worker pakai Cache API

Satu-satunya cara meng-cache di edge saat pakai preset Workers. Response cache-hit
menghabiskan ±2–5 ms CPU, bukan 150–350 ms.

- `layers/base/server/middleware/00.edge-cache.ts`: untuk GET yang cacheable
  (pakai tabel `resolveCacheControl` yang sudah ada), cek `caches.default.match()`;
  kalau hit, kembalikan `Response` langsung (h3 1.15 mendukung `return Response`).
- Simpan di hook `beforeResponse` (`cacheControl.ts`) via `event.waitUntil` — **hapus
  `set-cookie` sebelum `cache.put()`**, kalau tidak Cache API menolak.
- Naikkan TTL: HTML `s-maxage=300` → **3.600–86.400** (konten diedit dari dashboard
  PM One, bukan real-time). API tetap pendek.
- Cache key = URL absolut → bisa di-purge lewat API purge-by-URL saat konten dipublish.

Estimasi: 22.372 render/hari → ±1.500–2.500 render/hari. **CPU turun ±85–90%.**

### P0-B — Hentikan cookie i18n di response yang cacheable

`detectBrowserLanguage.useCookie` + `alwaysRedirect: true` menempelkan `Set-Cookie` pada
setiap response HTML dan menambah 1 redirect-invocation per kunjungan `/`.
Set cookie di sisi client saja, dan matikan `alwaysRedirect` untuk halaman selain `/`.

### P0-C — Blokir sampah sebelum masuk Worker

WAF Custom Rule dievaluasi **sebelum** Worker → invocation-nya benar-benar nol dan gratis.
Per zone (Free plan dapat 5 custom rule):

```
(http.request.uri.path contains "/wp-")     or
(http.request.uri.path contains "/wp-json") or
(http.request.uri.path contains "xmlrpc")   or
(ends_with(http.request.uri.path, ".php"))  or
(http.request.uri.path contains "/.env")    or
(http.request.uri.path contains "/.git")
→ Block
```

Hilangkan ±18.600 invocation/hari.

### P0-D — ~~Matikan endpoint `/api/_nuxt_icon/*`~~ → DIBATALKAN

> **Koreksi 23 Jul 2026 (temuan salah pada revisi pertama).** Dokumen ini semula menyatakan
> endpoint `/api/_nuxt_icon/*` "membalas `204` kosong / invocation sia-sia" dan menyarankan
> mematikannya. **Itu keliru** — kesimpulannya lahir dari `curl` tanpa query string.
> Endpoint ini menerima `?icons=a,b,c`:
>
> ```
> /api/_nuxt_icon/lucide.json                 → 204, 0 byte   (tanpa query)
> /api/_nuxt_icon/lucide.json?icons=x,menu    → 200, 604 byte (trafik asli)
> ```
>
> Jadi 12.966 request/hari itu **melayani data ikon sungguhan**. `icon.fallbackToApi: false`
> akan menghilangkan ikon yang nama koleksinya datang dari data dashboard (tidak bisa di-scan
> statis oleh `clientBundle.scan`). Penanganan yang benar: **biarkan endpoint-nya**, lalu serap
> bebannya lewat Cache API di P0-A — response-nya sudah membawa
> `cache-control: s-maxage=604800`, jadi setelah edge cache aktif hampir semuanya jadi cache
> hit (±3 ms) alih-alih invocation penuh.

### P1-A — Prerender halaman publik (paling ampuh, 0 invocation)

Sitemap tiap site kecil (ICC: 78 URL `en` + 33 `id`; Megabuild: 305 + 26). Dengan
Workers Static Assets, halaman yang di-prerender dilayani tanpa memanggil worker sama sekali.
Prerender seluruh halaman publik × locale saat build, lalu picu rebuild dari dashboard
PM One saat konten berubah (deploy hook). Ini yang mengunci tagihan di $5 secara permanen.

### P1-B — Perkecil biaya per render

- `__NUXT_DATA__` 65–98 KB: `pick`/`transform` pada `useAsyncData`, buang field yang tidak
  dipakai client.
- 87–93 KB inline SVG per halaman: `icon.mode: 'css'` atau sprite untuk ikon berulang.
- 103–115 tag `<link>` per halaman.

### P1-C — Perbaiki 404 `/_nuxt/*`

3.103/hari dari HTML atau service worker basi. Atur `assets.not_found_handling` supaya
`/_nuxt/*` yang tidak ada dibalas 404 statis, bukan lewat SSR.

### P2 — Guardrail

- Budget alert CPU di 25M ms/siklus (akun sudah punya 1 budget alert — perlu diverifikasi ambangnya).
- Lanjutkan `docs/cf-cpu-daily-log.md` harian selama siklus Agustus.

### Perkiraan hasil

| Tahap | CPU/hari | CPU/siklus | Tagihan |
|---|---:|---:|---:|
| Sekarang | 12–18M | ±380M | $12,52 |
| Setelah P0 (A–D) | 1,5–2,5M | 45–75M | $5,30–$5,90 |
| Setelah P0 + P1 | 0,3–0,8M | 9–24M | **$5,00** |

P0 saja belum cukup untuk kembali ke $5 — **P1-A (prerender) wajib** kalau targetnya
benar-benar $5,00 tanpa tambahan.
