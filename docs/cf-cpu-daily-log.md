# Cloudflare Workers CPU — Log Harian

Siklus billing: reset tanggal 22 tiap bulan. Kuota gratis: 30 juta ms CPU + 10 juta requests.
Target: siklus 22 Jul – 22 Ags 2026 selesai **di bawah 30M ms** → tagihan kembali $5,00.

Konteks & analisa: `cf-cpu-investigation-2026-07.md` · Rencana: `cf-cpu-plan-2026-07.md`

Cara ambil angkanya (butuh sesi dashboard Cloudflare, atau token `Account Analytics: Read`):

```graphql
{ viewer { accounts(filter: {accountTag: "3797ae01f7dfb6dffb5a1b3f82713c33"}) {
  workersOverviewRequestsAdaptiveGroups(limit: 100,
    filter: {date_geq: "YYYY-MM-DD", date_leq: "YYYY-MM-DD"}, orderBy: [date_ASC]) {
    dimensions { date } count sum { cpuTimeUs } } } } }
```

## Baseline

| Periode | CPU total | Requests | Rata-rata | Tagihan |
|---|---:|---:|---:|---|
| Siklus 22 Jun – 22 Jul 2026 | 373.604.916 ms | 11.669.408 | 12–18M ms/hari | **$12,52** |
| Siklus 22 Jan – 22 Feb 2026 (normal) | 1.574.891 ms | 71.418 | — | $5,00 |

## Log

| Tanggal | Hari siklus | CPU total (M ms) | Billable | Cache rate | Catatan |
|---|---|---|---|---|---|
| 2026-07-14 | 23/30 | 256,02 | 227,56 | 54,7% | Pra-perbaikan. "Cache rate" di sini cache rate zona (mayoritas aset statis), bukan penghindaran Worker — menyesatkan, itu sebabnya CPU tetap tinggi walau angkanya terlihat bagus. |
| 2026-07-16 | 25/30 | 289,26 | 260,79 | 53,2% | Pra-perbaikan (dilebur dari `cloudflare-cpu-daily-log.md` yang duplikat, kini dihapus). |
| 2026-07-22 | 1/31 | 14,81 | — | — | **Hari 1 siklus, PRA-perbaikan.** Sudah membakar separuh kuota bulanan (14,8 dari 30M) sebelum fix ada. Konsekuensi: invoice 22 Ags kemungkinan masih memuat kelebihan kecil sekalipun sisa siklus sempurna. |
| 2026-07-23 | 2/31 | 3,67 (s.d. 11:20 WIB) | — | — | **Hari perbaikan (6 deploy, terakhir ±06:30 WIB).** WAF 27→28 zone; edge cache + validasi `x-edge-build` (bukan di key — purge tetap jalan); bot-variant collapse; purge varian `__cm`/`locale` diverifikasi live (HIT→purge→MISS→HIT). Bukti cache bekerja: **p50 icc turun 47 ms → 4–6 ms**, avg 129 → 40–48 ms; artikel HIT dgn age 4+ jam; asset cache-hit icc 98,91%. Catatan: angka 22 Jul terkoreksi 14,81 → **15,45M** (data settle terlambat) → kumulatif 2 hari ±19,1M dari kuota 30M. |

## Kenapa TTL dinaikkan, bukan diturunkan (23 Jul 2026)

Diukur dari trafik 24 jam (22 Jul), request HTML status 200 yang sampai ke Worker:

| Kategori | Request/hari | URL unik | Rata-rata/URL |
|---|---:|---:|---:|
| `/news/{artikel}` | 21.689 | 1.847 | 11,7 |
| root `/` telanjang | 5.134 | 50 host | 103 |
| halaman tetap lain | 2.538 | 503 | 5,0 |
| `/brands/{brand}` | 1.953 | 439 | 4,4 |

**95% URL dapat <24 request/hari.** Pada ekor sedatar itu TTL pendek tidak menolong —
halaman tetap di-render hampir setiap kali diminta. Render/hari untuk halaman detail:

| TTL | Render/hari | CPU/hari |
|---|---:|---:|
| 1 jam | 11.053 | 2,76M ms |
| 6 jam | 6.207 | 1,55M ms |
| 24 jam | 2.291 | 0,57M ms |
| **7 hari** | **327** | **0,08M ms** |

Menurunkan TTL ke 5 menit malah menaikkan CPU ~+73% (+84M ms/siklus ≈ +$1,70) tanpa
manfaat kesegaran apa pun — kesegaran datang dari **purge**, bukan dari TTL. Karena itu
halaman detail dipasang 7 hari (aman karena Post/Brand/Guest punya `edgeCachePaths()`),
HTML umum 6 jam, dan root `/` dibuat cacheable dengan cache key yang memuat cookie
`i18n_locale` + `Accept-Language`.

⚠️ **Ketergantungan yang harus dijaga:** kalau `edgeCachePaths()` dihapus dari salah satu
model, TTL 7 hari untuk rute itu HARUS ikut diturunkan, atau editan tidak terlihat seminggu.

## FASE 2 di-deploy 23 Jul ±18:45 WIB (commit `3c59036` events + `c55e54ce` pmone)

Isi: TTL maksimal (list+home 7 hari, detail+statis 30 hari; API tetap 120/60 dtk) ·
key `/` dikolapskan (AL first-match, cookie-precedence) → **home kini purgeable & di-purge oleh
tag blog-posts/banners/media-coverages/events/rundown** (`homeVariantUrls()`, 26 URL/site) ·
**404 HTML di-cache 1 jam** (2 jalur capture, klien JSON tetap dapat JSON segar) ·
~~diet logo (icc `<img>` −82 KB/halaman artikel; megabuild/renex CSS mask; flei mark)~~
**[DI-REVERT 25 Jul — logo ter-letterbox, lihat catatan di bawah]** ·
`php artisan edge:purge {--project=|--all}` sebagai katup darurat · global-ai-expo → provider
gambar cloudflare. Regresi workerd 10/10; visual light+dark diverifikasi.

⚠️ Aturan sinkron BARU: skema key worker (`buildEdgeCacheKey`) ⟷ `EdgeCache::homeVariantUrls()`
pmone WAJIB berubah bersamaan. Dan setiap menaikkan TTL rute → pastikan ada tag purge yang
menjangkaunya.

## 24 Jul — GATE H+1 **GAGAL**, dan temuan yang membatalkan asumsi fase 2

**Angka (jendela bersih 20 jam sejak deploy terakhir 23 Jul 19:05 WIB, nol deploy):**

| Metrik | Nilai | Gate |
|---|---:|---|
| Laju harian mapan (20 jam) | **7,78M ms/hari** | <1M → **GAGAL 7,8×** |
| Laju 12 jam terakhir | **6,60M ms/hari** | <1M → **GAGAL 6,6×** |
| Harian kalender: 21→22→23 Jul | 18,10 → 15,45 → 9,10M | — |
| p50 icc | 4,8 ms ✓ | ≤8 ms → lolos |

Perbaikan nyata vs baseline (18,1M → ~7M = **−61%**), tapi jauh dari target.

**TEMUAN UTAMA — kenaikan TTL fase 2 praktis tidak berguna.** Bukti: dari sampel `age` di
seluruh icc, **entri tertua = 72.872 dtk (20,2 jam) = persis sejak deploy**. Tidak satu pun
mendekati TTL 7 hari (604.800 dtk), apalagi 30 hari. Dan halaman nav utama (`/brands`,
`/rundown`, `/programs`, `/partners`) **MISS** setelah 20 jam situs live — padahal terbukti
tersimpan normal begitu di-request (MISS → HIT age 52–112 dtk).

Kesimpulan: **Cloudflare Cache API meng-evict entri ekor jauh sebelum TTL.** TTL hanya batas
atas; yang menentukan adalah frekuensi akses per-colo. Menaikkan 7→30 hari tidak mengubah apa
pun untuk ekor panjang.

**Sebaran kesehatan per worker (jendela bersih):**

| Cache jalan (p50 <12 ms) | Cache tak efektif (p50 74–144 ms) |
|---|---|
| icc 4,8 · inacon 9,5 · flei 11,8 · megabuild 11,8 | keramika 74 · morefood 80 · panorama-events 113 · cafeexpo 120 · icf 138 · cokelatexpo 144 |

Polanya: **request per URL per colo**, bukan volume total. Situs dengan banyak URL & trafik
sedang → hampir tiap request adalah render penuh.

**Proyeksi siklus:** 15,45 + 9,10 + ~7 + (28 × ~7) ≈ **228M ms** → billable ~198M →
**+$3,96** → invoice 22 Ags ≈ **$8,96**. Lebih baik dari $12,52, jauh dari $5.

## 24 Jul sore — FASE 3 deployed (commit `154661e`) + MODEL TERKOREKSI

**Dua koreksi model penting (jangan dilupakan lagi):**
1. Sistem punya **DUA lapis cache**: CDN Cloudflare (Cache Rule lama, semua zone) meng-cache
   respons worker yang **bebas set-cookie** — yaitu respons `x-edge-cache: HIT` kita yang
   set-cookie-nya di-strip. Render segar (ber-cookie) tak di-cache CDN. Bukti:
   `cf-cache-status: HIT` di API/HTML/icon. Rantai: CDN → worker → Cache API → render.
   Purge by-URL menghapus KEDUA lapis sekaligus (satu panggilan).
2. Komposisi request ZONE ≠ komposisi INVOCATION worker (zone flei 31k req API/20j vs 9,1k
   invocation total). Analisa CPU wajib dari `workersInvocationsAdaptive`, bukan zone.

**Akar gagalnya gate H+1 (7,78M/hari):** TTL API sendiri (60–120 dtk) → semua endpoint × semua
colo re-render penuh tiap ≤2 menit selamanya; plus 302 i18n "/" yang boot app penuh tiap
kunjungan pengunjung ber-bahasa-id; plus eviction dini entri HTML dingin (nyata, bukan teori).

**Isi fase 3:** API STABLE tier 6 jam (11 endpoint ber-?locale saja, semua purge-covered;
detail per-slug TETAP 120 dtk — variannya tak terenumerasi purge) · 302 "/" di-cache via
res.end wrap (sendRedirect mem-bypass beforeResponse) · 20 ikon runtime → client bundle ·
getCachedData di useProjectProfile/useEvent · list posts trim 109,7→58,3 KB (field terukur
dari konsumen; detail route utuh). Regresi workerd 13/13.

## 24 Jul ±16:10 — INSIDEN: trim payload fase-3 merusak semua gambar posts (RESOLVED ±17:30)

Trim allowlist di `blog/posts.get.ts` membuang `featured_image.md/.sm/.original` — persis
rantai `src` PostCard (`md.url || sm.url || original`). Grep verifikasi pra-deploy tidak
menjangkau PostCard.vue, dan gejala yang sama SUDAH terlihat di uji lokal tapi di-wave-away
sebagai "provider gambar tak jalan lokal". Dampak: semua kartu posts (news, slider di hampir
semua halaman) hanya menampilkan LQIP.

Penanganan: trim di-REVERT TOTAL (sisa yang aman cuma ±4 KB — tak sepadan), deploy `29bbcaa`,
lalu `php artisan edge:purge --all` (pemakaian perdana katup darurat — payload cacat tertanam
di HTML ter-cache ber-TTL s.d. 30 hari). Catatan tambahan: purge-all juga mengosongkan cache
`cdn.pmone.id` (satu zone dgn ai.pmone.id) → gambar lambat sesaat ketika CDN menghangat lagi.

Pelajaran wajib: (1) verifikasi konsumen field harus menjangkau SEMUA komponen (layers+apps),
bukan grep sempit; (2) anomali visual saat verifikasi = temuan, bukan noise; (3) trim payload
allowlist berisiko tinggi — kalau diulang, pakai denylist field yang terbukti nol pemakaian;
(4) tab automation membekukan `loading="lazy"` native → verifikasi gambar via probe eager,
bukan screenshot (lihat memory chrome-automation-freezes-raf-canvas).

## Gate fase 3 (realistis, berbasis data — bukan fantasi)

- **H+1 (25 Jul): < 3M ms/hari** (jendela bersih, metrik worker-side).
- **H+3 (27 Jul): < 2M ms/hari.**
- Meleset → analisa komposisi invocation PER WORKER (workersInvocationsAdaptive), bukan zone,
  sebelum menyentuh apa pun.

## Gate keputusan (di-reset pasca-deploy fase 2)

- **H+1 (24 Jul):** CPU harian **< 1M ms** (cache mengisi ulang pasca-deploy sore).
- **H+3 (26 Jul):** CPU harian **< 0,6M ms** dan p50 icc ≤ 8 ms (agregat 24 jam).
- Kalau meleset → satu-satunya tuas tersisa: full diet field posts (payload `pinia` ±58 KB) —
  butuh keputusan user karena menyentuh data flow.

## Matematika tagihan yang jujur (ditulis 23 Jul)

- Tarif kelebihan: **$0,02 per 1 juta ms**. Jadi 3M ms/hari = 90M/siklus = 60M billable =
  **+$1,20** — bukan 3× tagihan. Tetap bukan target; target = $5,00 flat.
- **Hari 1 siklus (22 Jul) sudah membakar 14,81M** dari kuota 30M — sebelum perbaikan ada.
  Sisa kuota ≈ 15M untuk 30 hari ≈ 0,5M/hari. Maka **invoice 22 Agustus kemungkinan masih
  memuat kelebihan kecil (puluhan sen s.d. ±$1)** sekalipun steady state tercapai.
  **$5,00 bersih yang realistis adalah invoice 22 September.**
- Sisa CPU yang tak bisa hilang oleh TTL: (1) Cache API **per-colo** — tiap colo bayar MISS
  sendiri per URL per varian; (2) **tiap deploy me-reset seluruh cache HTML** (build-id) —
  disiplin deploy = bagian dari biaya; (3) biaya per-render masih ±150 ms sampai fase payload
  dikerjakan.

## 24 Jul malam (21:40 WIB) — pengukuran pasca fase 3, dan temuan yang membatalkan asumsi fase 3

⚠️ **Angka hari ini TIDAK sah untuk menilai gate H+1.** Deploy `154661e`/`29bbcaa` masuk
±16:00–17:30 WIB, lalu `edge:purge --all` mengosongkan seluruh cache ±17:30. Empat jam terakhir
adalah cache yang mengisi ulang dari nol. Penilaian gate yang sah: 25 Jul, jendela 24 jam tanpa
deploy.

**Harian kalender (`workersOverviewRequestsAdaptiveGroups`, cpuTimeUs/1000):**

| Tanggal | CPU (M ms) | Invocation |
|---|---:|---:|
| 21 Jul | 18,10 | 128.472 |
| 22 Jul | 15,45 | 105.809 |
| 23 Jul | 9,10 | 90.561 |
| 24 Jul (s.d. 14:40 UTC) | 4,76 | 50.794 |

**Rolling 24 jam (23 Jul 14:00 → 24 Jul 14:00 UTC): 8,36M ms / ~80.000 invocation / avg 105 ms.**
Turun 54% dari puncak 18,10M, masih 8,6× di atas laju sustainable (30M ÷ 31 hari = 0,97M/hari)
dan 2,8× di atas gate fase 3 (<3M). Perbandingan jam yang sama 00–14 UTC: 5,95M (23 Jul) →
4,76M (24 Jul) = **−20%**.

**Kuota siklus praktis habis di hari ke-3:** 15,45 + 9,10 + 4,76 = **29,3M dari 30M**.
Proyeksi kalau bertahan di 8,4M/hari: ~256M/siklus, billable ~226M, invoice 22 Ags ≈ **$9,50**.

**p50 per worker (jendela 11:00–15:00 UTC, `workersInvocationsAdaptive`):**

| Cache efektif | p50 | Cache tidak efektif | p50 |
|---|---:|---|---:|
| icc | 4,8 ms | panorama-media | 45 ms |
| iicc | 7,3 ms | panorama-events | 51 ms |
| inacon | 9,7 ms | cafeexpo | 94 ms |
| flei | 14 ms | icf | 112 ms |
| campx | 20 ms | morefood | 120 ms |
| megabuild | 27 ms | keramika | 174 ms |
| | | outingexpo · renex · cokelatexpo | 185–238 ms |

Pola 24 Jul pagi terulang persis. Fase 3 tidak mengubah sebaran ini.

**Angka kunci yang menjelaskan semuanya: avg CPU per invocation cuma turun ±120 ms → 105 ms.**
Seluruh penghematan sejauh ini datang dari **invocation yang berkurang** (150k → 80k/hari, CDN
menyerapnya), bukan dari invocation yang jadi murah. Mayoritas request yang sampai ke worker
tetap render penuh.

### Kenapa fase 3 tidak bergerak: jalur SSR internal tidak lewat edge cache

`s-maxage=21600` fase 3 hanya melindungi request **eksternal** ke `/api/*`. Jalur yang membakar
CPU (plugin SSR memanggil route-nya sendiri) tidak pernah menyentuh edge cache.

Bukti dari zona `pmone.id`, host `api.pmone.id`, 24 jam:

| Endpoint | Calls | Hit rate CDN |
|---|---:|---:|
| `projects/{u}/website-settings` | 15.719 | 72% |
| `projects/{u}/events/{e}` | 10.164 | 80% |
| `projects/{u}` (profile) | 9.479 | 66% |
| `projects/{u}/editions` | 9.066 | 65% |
| `blog/posts` | 8.560 | 34% |
| `banners` | 3.482 | 23% |

Kalau jalur internal ikut ter-cache 6 jam, `website-settings` mestinya ~700 panggilan/hari
(16 situs × ~12 colo × 4 refresh). Terukur 15.719, yaitu 22×. `editions` sama polanya.

Mekanismenya: `$fetch("/api/...")` internal lewat `localFetch`, jadi `getRequestURL(event)`
menghasilkan `http://localhost/api/...`. `buildEdgeCacheKey` memakai URL itu apa adanya, dan
Cache API Cloudflare menolak key dengan hostname di luar zona. `match()` selalu undefined,
`put()` gagal dan tertelan `catch`. Middleware-nya jalan, tapi tidak pernah bisa menyimpan atau
menemukan apa pun.

Satu-satunya pelindung jalur SSR adalah `defineCachedEventHandler` dengan **`maxAge: 15`** di
driver `memory` (per-isolate, mati bersama isolate). Menyerap ±65% panggilan berulang.

**Dimensi `requestSource` memastikan asal trafiknya:** dari 97.423 request ke `api.pmone.id`,
**86.477 (89%) adalah `edgeWorkerFetch`**. Sisanya eyeball. Agregat worker → PM One: hit 38.372,
miss 32.682, bypass 11.892 → **~46.000 panggilan/hari tembus ke origin Laravel.**

### Tuas yang SUDAH dihitung dan ditolak (jangan diulang)

1. **Naikkan `maxAge` dari 15 dtk.** Ceiling penghematan: 56.000 panggilan upstream/hari ×
   ±2 ms (parse JSON + overhead $fetch) = **0,11M ms/hari = 1,3%** dari 8,4M. Biayanya: purge
   tidak menjangkau cache memory Nitro, jadi editan bisa telat sebesar maxAge tanpa cara
   memaksa. Trade-off jelek. Bump kecil ke 60 dtk boleh kalau tujuannya meringankan origin,
   bukan tagihan.
2. **Normalisasi cache key `blog/posts`/`banners` di Cache Rule.** **TIDAK BISA:** zona
   `pmone.id` ada di plan **Free**, custom cache key adalah fitur Enterprise. Page Rule
   "Ignore Query String" (satu-satunya alternatif di Free) akan menyamakan `?page=2` dan
   `?locale=en` → salah konten. Kardinalitasnya juga asli, bukan bug normalisasi: home minta
   `per_page=6`, halaman news minta `page=N`, kategori dan search punya param sendiri.
   Efek ke CPU worker nol juga, karena worker tetap parse response-nya entah hit atau miss.
3. **Jalur internal pakai URL absolut** supaya masuk lapis CDN. **DITOLAK USER 24 Jul:**
   hackish, bikin codebase kotor dan susah dimengerti nanti.

Kesimpulan yang jujur: poin 1 dan 2 sama-sama mengurangi beban origin Laravel, bukan tagihan
Cloudflare. Sisa CPU ada di render pada 12 situs bertrafik rendah yang entri cache-nya
di-evict duluan, dan itu belum ada tuas yang murah.

### Temuan kecil

Request **HEAD mem-bypass edge cache sepenuhnya**: tidak ada header `x-edge-cache`, `set-cookie`
ikut keluar, artinya render segar. Volumenya kecil (102/hari di flei), jadi bukan prioritas.

`/api/sheets/*` = 8.764 request/hari dari eyeball (integrasi Google Sheets), semuanya bypass
cache, dengan ±70 error 520/522/524/525 per hari. Itu sinyal origin sempat kewalahan, bukan
masalah worker.

## 24 Jul ~23:30 WIB - eksekusi CLOUDFLARE_WORKERS_OPTIMIZATION_PLAN

**Baseline pra-perubahan (23 Jul 16:00 -> 24 Jul 16:00 UTC):** akun **7,942M ms / 76.904
invocation**. Zona uji tiered cache (flei+keramika) 1,728M ms = 21,8%. Sisa 14 worker
6,213M ms - itu dasar gate H+1 besok supaya angkanya tidak tercemar eksperimen.
p50: flei 11,7 ms (p75 146 ms) · keramika 66,8 ms (p75 292 ms) · cokelatexpo 176 ms ·
outingexpo 23,6 ms.

**DILAKUKAN:**
1. **Smart Tiered Cache ON di 28 zona (SEMUA).** Awalnya cuma flei + keramika sebagai
   eksperimen, lalu user memerintahkan langsung ke semua project. Konsekuensi yang diterima:
   gate H+1 fase 3 hangus karena seluruh jendela tercemar. Pembanding yang dipakai untuk
   26 Jul adalah baseline 7,942M ms / 76.904 inv di atas.
   `PATCH /zones/{id}/cache/tiered_cache_smart_topology_enable {"value":"on"}`,
   UI konfirmasi "Tiered Cache Topology: Active". Gratis di Free. Catatan: endpoint
   `argo/tiered_caching` tetap membaca `off`/`editable:false` - itu setting Argo legacy,
   BUKAN indikator smart topology. Jangan bingung lagi.
2. **AI bot policy diverifikasi di 28 zona:** semua sudah `ai_training=block`,
   `ai_search=disabled`, `ai_user=disabled`, `fight_mode=false`. Endpoint pembacanya
   `GET /zones/{id}/bot_management`. Nol zona yang perlu diperbaiki.
3. **WAF `block-seo-scrapers` di-deploy ke 15 zona** (append ke ruleset existing yang sudah
   berisi `block-cms-scanners`; tiap zona kini 2/5 rule). Target: AhrefsBot, SemrushBot,
   PetalBot, MJ12bot, DotBot, DataForSeoBot, BLEXBot, serpstatbot, ZoominfoBot, Barkrowler,
   SeekportBot, MegaIndex. Volume terukur ±4.200 request/hari yang lolos CDN dan hampir
   semua ber-status 200 (= render penuh) -> estimasi hemat **0,6-0,8M ms/hari (8-10%)**.
   Verifikasi: AhrefsBot/SemrushBot -> 403; Chrome/Googlebot/iPhone -> 200; admin pmone.id
   -> 302 normal. **Baidu/Yandex/Sogou SENGAJA dibiarkan lewat** - itu search engine,
   punya nilai user-facing, bukan scraper.

### TEMUAN 1 (mahal, jangan diulang): "junk UA 21% trafik" ITU SALAH BACA

Entri UA-kosong yang di plan disebut junk (527.603/hari) ternyata **operasi Cache API worker
kita sendiri**, terbukti dari dimensi `requestSource: edgeWorkerCacheAPI`:

| Pola | Jumlah/hari (flei) | Artinya |
|---|---:|---|
| GET 200 edgeWorkerCacheAPI | 21.998 | `cache.match()` HIT |
| GET 504 edgeWorkerCacheAPI | 15.908 | `cache.match()` MISS |
| PUT 204 edgeWorkerCacheAPI | 14.757 | `cache.put()` menyimpan |

Ini juga menjelaskan misteri "PUT 204 ke `/.ssh/id_ecdsa`" dari catatan sebelumnya: itu
bukan serangan, itu worker menyimpan respons 404 ke cache. **Tidak ada yang bisa/perlu
diblok di sini.** HeadlessChrome juga gugur sebagai target: mayoritas volumenya cache HIT
di aset, non-hit-nya cuma puluhan (`/cdn-cgi/rum`, `_nuxt/*.js`) dan berbau layanan render
yang sah. Aturan: **selalu pecah statistik UA dengan `requestSource` sebelum menyimpulkan
ada bot.**

### TEMUAN 2: Cache Response Rules TIDAK berlaku untuk respons Worker (diuji, di-rollback)

Hipotesis dari blog CF 2026 (`introducing-cache-response-rules`): render segar tidak pernah
masuk cache CDN karena membawa `Set-Cookie: i18n_locale`, jadi kalau cookie itu di-strip di
response phase, render pertama langsung ter-cache dan (dengan tiered cache) dipakai semua
colo lain. Probe membuktikan premisnya benar:

```
req1  edge=MISS  cdn=-     set-cookie=1   <- render 150-350 ms, CDN TIDAK menyimpan
req2  edge=HIT   cdn=HIT   set-cookie=0   <- worker jalan lagi (±3 ms), BARU CDN menyimpan
req3  edge=HIT   cdn=HIT   age=5          <- worker tidak dipanggil
```

Rule `http_response_cache_settings` + `set_cache_settings` + `strip_set_cookie:true`
di-deploy ke 15 zona. **Tidak berpengaruh sama sekali** - req1 tetap membawa Set-Cookie dan
tetap tidak masuk CDN. Uji isolasi dengan ekspresi paling sederhana (`starts_with(path,
"/id/news")`, tanpa kondisi response-header) juga nihil. Kesimpulan: phase itu hanya jalan
pada respons yang Cloudflare ambil dari origin sungguhan; route Worker mengakhiri request
sebelum jalur tersebut. Semua rule sudah dihapus (`rules: []` di 15 zona), diverifikasi
kembali normal termasuk admin `pmone.id` (3 Set-Cookie utuh). Biaya percobaan: nol.

⚠️ Celahnya sendiri MASIH ADA dan masih jadi akar biaya situs dingin: render mahal tidak
pernah mengisi cache CDN, yang mengisi hanya salinan request kedua. Untuk URL ekor yang
dapat ±11 request/hari tersebar ke 12 colo, request kedua di colo yang sama nyaris tak
pernah terjadi. Satu-satunya cara menutup ini dari sisi kita adalah worker berhenti
mengirim `Set-Cookie` pada render yang memang cacheable - itu perubahan kode di
pmone-events, BELUM diusulkan ke user, dan harus dihitung dulu.

## 25 Jul — diet logo fase 2 DI-REVERT (regresi visual)

Logo FLEI di header patah: mark terpisah jauh dari logotype. Sebabnya bagian "diet logo" di
`3c59036`, yang mengubah 5 komponen logo dari inline `<svg>` jadi `<img>` / `<span>` + CSS mask.

Akarnya: atribut `width`/`height` pada `<img>` adalah **presentational hint**, bukan cuma info
aspect ratio. Semua caller hanya mengirim class tinggi (`h-full` di wrapper `h-9`), jadi tinggi
ikut class tapi lebar tetap terkunci di angka atribut → gambar ter-letterbox di kotak yang jauh
lebih lebar. FLEI paling kentara (mark 142×143 dipaksa jadi 142×36). icc lebih halus: header `h-8`
kebetulan pas dengan intrinsic 110×32, tapi footer `h-12` menahan lebar di 110px padahal harusnya
165px.

Yang dikembalikan ke kondisi sebelum `3c59036` (byte-identical, `git diff 3c59036^` kosong):
flei `LogoMark.vue`, icc + inacon `LogoICC.vue`, renex `Logo.vue`, override megabuild `Logo.vue`
dihapus (kembali ke base layer), dan 5 file `public/img/logo-*.svg` dihapus karena tidak ada lagi
yang mereferensikan.

Penghematan yang hilang: ~82 KB/halaman di icc/inacon, ~38 KB renex, ~18 KB megabuild, ~10 KB flei
(sebelum kompresi). Kalau mau dicoba lagi, syaratnya `<img>` WAJIB punya class lebar (`w-auto`)
supaya presentational hint tidak mengunci lebar — atau logo tetap inline tapi dirender sekali lalu
dipakai ulang lewat `<use>`. Jangan mengandalkan atribut width/height polos.

Bagian `3c59036` yang lain (TTL, key `/`, 404 cache) tidak disentuh. `PostSlider.vue` juga
dibiarkan seperti sekarang.

## 25 Jul ±03:40 — INSIDEN: purge jalan, konten tetap basi (race SWR × purge)

Gejala: CTA label banner FLEI diganti di dashboard, homepage tetap menampilkan teks lama
berjam-jam. Origin sudah benar (`/api/banners` dan render MISS keduanya baru), tapi varian
edge `/?__cm=dark&__lc=en&__al=-` tetap HIT dengan isi lama.

Tersangka yang salah, biar tidak diulang: purge memang **jalan**. Horizon mencatat
`PurgeEdgeCache` completed 03:39:02, dan purge-by-URL untuk key homepage terbukti bekerja
kalau diuji manual. Yang bikin diagnosa mutar-mutar: `EdgeCache::purgeUrls()` cuma nge-log
saat GAGAL, jadi "log kosong" bisa berarti sukses atau tidak pernah dipanggil. Sekarang ada
`Log::info('Edge purge: urls', [...])` di jalur sukses.

Penyebab sebenarnya, lapisan ketiga yang selama ini tidak dihitung: 14 GET proxy di
`server/api/` pakai `defineCachedEventHandler` maxAge 15 **+ `swr: true`**, dan cache itu ada
di DALAM worker, tidak terjangkau purge. Urutannya:

```
03:38:5x  editor save  → backend response cache clear (origin fresh)
03:39:02  purge jalan  → semua varian HTML "/" dibuang
03:39:07  visitor      → SSR baca payload LAMA dari cache handler (SWR sajikan stale)
          hasilnya disimpan sebagai HTML "fresh" → TTL 7 HARI
```

Purge yang cepat justru merugikan: dia membuang HTML tepat saat worker masih memegang payload
lama, lalu render berikutnya memfosilkan isi lama untuk seminggu.

Perbaikannya dua sisi dan harus tetap lockstep:

- events: `swr: false` di 14 cached handler. Dengan SWR, entry kedaluwarsa tetap disajikan
  sambil revalidasi di background, jadi request yang memicu refresh justru dapat data lama.
- pmone: `PurgeEdgeCache::DEBOUNCE_SECONDS` 5 → 20, harus di atas maxAge 15 supaya entry
  handler yang ditulis sebelum edit sudah kedaluwarsa saat purge mendarat. Naikkan maxAge di
  events = naikkan debounce di pmone.

Bonus dari investigasi yang sama: `zoneForHost()` me-refresh zone list sekali per URL yang
hostnya tak terjangkau. Tiap site menyumbang ~32 URL per tag purge, jadi satu domain di luar
akun bikin satu job memanggil Cloudflare API 30+ kali sekaligus menghapus cache zone untuk
host valid sesudahnya. Sekarang refresh dibatasi sekali per operasi purge.

Sekalian dicek: token purge menjangkau **semua** 28 zone di akun, `askindo.id` termasuk.
Komentar lama yang bilang iicc ada di akun Cloudflare lain sudah usang, dan sudah dikoreksi
di `EdgeCache.php`.

## 25 Jul — cleanup `server/api/**`: request redundan, payload, duplikasi

Bukan soal cache kali ini, tapi soal berapa banyak yang diminta per render. Semua analytics PM One
dipertahankan utuh (banner impression, brand visit, link click, view count post) — yang dipangkas
cuma request yang hasilnya tidak dipakai dan item yang tidak pernah dirender.

Yang hilang dari tiap SSR homepage:

| Request | Kenapa hilang |
|---|---|
| `/api/editions` | Header memfetch-nya di SETIAP halaman, padahal edition picker cuma ada di 4 route (brands/rundown + varian edisi). Sekarang idle lewat `useEditions({ immediate })`. |
| resolve active event × N | Enam handler `event/*` menyalin blok resolve yang sama, jadi tiap section = 2 request. Sekarang satu `defineCachedFunction` di `server/utils/resolveEventSlug.ts`. |
| 29 post | Store selalu minta `per_page: 50`; slider merender 20. Slider sekarang minta 21, `/news` tetap 50 (guard `perPage` di `fetchPosts`). |

Homepage flei: `__NUXT_DATA__` 137 KB → ~73 KB, HTML 451 KB → ~387 KB (perkiraan, ukur ulang
setelah deploy). Halaman home juga tidak lagi menembak `/api/event/rundown` dua kali: auto-key Nuxt
dibuat per CALL SITE, jadi `useRundownVisibility` dan `Rundown.vue` yang ada di dua file berbeda
punya dua key. Sekarang keduanya memakai key eksplisit yang sama.

Dicek dan TIDAK diubah karena ternyata sudah dedupe: `PostRelated` (dipasang 2× di halaman artikel)
dan `useMediaCoverages` (2 pemanggil di `/partners`) sama-sama punya satu call site, jadi satu key.
Cara memastikan hal seperti ini tanpa menebak: `grep -o '"/api/...".\{0,120\}' apps/<app>/.output/
server/chunks/build/*.mjs` — auto-key muncul sebagai literal `"$xxxxxxxx"` di argumen terakhir.

Cleanup yang menyertainya, 56 file, −914 baris bersih:

- `server/utils/pmOneFetch.ts` sekarang punya tiga level: `pmOneRequest` (path penuh),
  `pmOnePublicFetch` (`/api/public/**`), `pmOneFetch` (project-scoped). Blok AbortController +
  error mapping yang tadinya disalin di 20 file hilang.
- 24 file kehilangan `|| "http://localhost:8000"`. Fallback itu membuat config produksi yang hilang
  berubah jadi request ke loopback worker, bukan kegagalan yang kelihatan.
- ~24 route (semua `hotels/*`, `tickets/*`, `track/*`) sebelumnya TANPA timeout sama sekali;
  sekarang semua punya. Route pembayaran dapat 30 s, upload 60 s, tracking 5 s.
- Empat route PDF yang nyaris identik → `server/utils/streamUpstreamPdf.ts`.
- Query passthrough ditutup: `blog/posts` dulu menyebar `...query` SETELAH default, jadi
  `?author=<project-lain>` bisa menarik post project lain lewat situs ini, dan tiap query string
  jadi cache entry sendiri. Sekarang allowlist + clamp `per_page`. Sama untuk banners dan hotels.
- `contact/submit` tidak lagi memakai `project_username` dari body client.
- Dua route tanpa pemakai dihapus: `tickets/email-lookup`, `hotels/.../room-types/.../
  daily-availability`.

Kontrak error tickets/hotels sengaja dipertahankan (`statusMessage`, bukan `message`) lewat opsi
`errorShape` — halaman promo dan pembayaran membacanya langsung.

## Cek cepat tanpa dashboard

```bash
for i in 1 2 3; do curl -sSI https://indonesiacomiccon.com/id/news/urutan-film-marvel \
  | grep -iE 'cf-ray|x-edge-cache'; done
```

⚠️ Pakai **GET**, bukan HEAD (`curl -sS -o /dev/null -D -`). HEAD mem-bypass edge cache dan
selalu terlihat seperti render segar.

`x-edge-cache: HIT` = dilayani cache (±3 ms CPU). `MISS` = render penuh (150–350 ms).
`SKIP` = memang tidak boleh di-cache (mis. `/`, checkout, tracking).

⚠️ **Cache API bersifat per-colo.** MISS pertama di tiap colo (SIN, HKG, CGK…) itu normal dan
bukan tanda caching gagal — perhatikan `cf-ray` untuk tahu colo mana yang melayani. Bukti entri
cache sungguhan adalah header `age` yang bertambah antar-request.

---

# 28 Jul 2026 — Pembacaan hasil + audit akar masalah ulang

Ditulis 28 Jul ~02:00 WIB. Semua angka diambil langsung dari Cloudflare GraphQL, endpoint
`paygo-usage`, database produksi (read-only), dan probe `curl` ke situs live pada tanggal itu.
Entri ini menjawab tiga hal: apakah turun, apa penyebab aslinya, dan apa yang layak dikerjakan.

## 1. Ya, turun. Ini angkanya

| Tanggal (UTC) | CPU | Invocation | ms/inv |
|---|---:|---:|---:|
| 21 Jul (puncak) | 18,10M | 128.472 | 141 |
| 22 Jul | 15,45M | 105.809 | 146 |
| 23 Jul | 9,10M | 90.561 | 101 |
| 24 Jul | 6,66M | 68.885 | 97 |
| 25 Jul | 4,46M | 62.333 | 72 |
| 26 Jul | 4,14M | 54.770 | 76 |
| 27 Jul (18,6 jam) | 3,12M | 41.008 | 76 |

Rolling 24 jam (26 Jul 18:00 → 27 Jul 18:00 UTC): **3,94M ms / 48.808 invocation / avg 81 ms**.
Blok 12 jam sejak 24 Jul: 4,75 · 4,62 · 3,64 · 4,56 · 3,87 · 4,02 → **mapan di 4,0-4,1M/hari**.

- vs baseline pra-tiered-cache 7,942M (23-24 Jul): **−50%**
- vs puncak 18,10M (21 Jul): **−78%**
- Request: 168k/hari (20 Jul) → ~50k/hari: **−70%**

**AKSI 2 dan AKSI 3 di `CLOUDFLARE_WORKERS_OPTIMIZATION_PLAN.md` LULUS.** Target gabungan
< 6M ms/hari, tercapai 4,0M.

### Siklus berjalan (dari `paygo-usage`, bukan estimasi)

| Meter | Terpakai | Billable | Biaya |
|---|---:|---:|---:|
| Workers CPU ms (kuota 30M) | 39.822.691 | 9.822.691 | $0,20 |
| Workers Requests (kuota 10M) | 382.358 | 0 | $0,00 |
| Build minutes (kuota 6.000) | 1.279 | 0 | $0,00 |

**Overage request sudah hilang total.** Di siklus Juni angkanya 11,67M request ($0,60); sekarang
proyeksi seluruh siklus ~1,8M, jauh di bawah kuota. Yang tersisa murni CPU.

Kuota 30M sudah habis di hari ke-3 siklus, dibakar 22 Jul (15,45M) + 23 Jul (9,10M) yang
keduanya hari pra-perbaikan. **Invoice 22 Ags tidak mungkin $5,00 apa pun yang terjadi.**

| Skenario laju | Total siklus | Billable | Invoice 22 Ags | Invoice 22 Sep |
|---|---:|---:|---:|---:|
| Bertahan 4,0M/hari | 140,6M | 110,6M | **≈$7,21** | ≈$6,88 |
| Turun ke 2,0M/hari | 90,3M | 60,3M | ≈$6,21 | ≈$6,24 |
| Turun ke 1,0M/hari | 65,0M | 35,0M | ≈$5,70 | **$5,00** |

Ambang $5,00 flat = **≤ 0,97M ms/hari**. Dari 4,0M sekarang, butuh potong 76% lagi.

## 2. Tiered cache terbukti bekerja — koreksi kesimpulan 24 Jul

Catatan 24 Jul menyimpulkan "Cache API meng-evict entri ekor jauh sebelum TTL, entri tertua
20,2 jam". **Itu sudah tidak berlaku.** Probe 28 Jul:

| URL | header `age` | Artinya |
|---|---:|---|
| `indonesiacomiccon.com/id/news/urutan-film-marvel` | 245.597 dtk | 68 jam |
| `franchise-expo.co.id/` | 135.148 dtk | 37,5 jam |
| `keramika.co.id/` | 76.888 dtk | 21 jam |

Smart Tiered Cache membuat salinan CDN bertahan berhari-hari. Jangan ulangi kesimpulan lama.

## 3. Penyebab aslinya — dan apa yang TERBUKTI BUKAN penyebab

### 3.1 Migrasi website-settings ke API BUKAN penyebabnya. Ditutup permanen.

Ini tuduhan yang paling masuk akal secara intuisi dan **terbukti salah dengan empat cara
independen**:

1. **Bukti tagihan.** Commit `88fa96f` (15 Jun) yang persis melakukan hal itu (hapus konstanta
   `app.config.ts` di semua app, ganti fetch runtime) jalan di produksi **7 hari penuh** di
   dalam siklus 22 Mei - 21 Jun yang ditagih **$5,00 flat**. Siklus itu di bawah 30M ms total.
   Kalau migrasi ini yang bikin dataran 11-14M ms/hari, siklus itu mustahil $5,00.
2. **Eksperimen terkontrol di produksi.** 2 Jul → 4 Jul panggilan upstream ke api.pmone.id turun
   49% (308.954 → 157.439/hari) dan khusus website-settings turun 76% (106.128 → 25.217).
   CPU Worker di hari yang sama **naik** 11,16M → 11,86M. Angka ini dari tabel
   `api_consumer_requests` di database produksi.
3. **Benchmark hop.** Satu `$fetch` internal ke `/api/event/website-settings` = **0,061 ms** CPU
   (payload produksi 4.781 byte). Sembilan hop homepage sekaligus = 0,503 ms. Lawan render
   150-350 ms. Bahkan dengan pesimisme 5× untuk workerd, seluruh lapis proxy internal itu
   **1,0-1,7% dari satu render**.
4. **Tes kontrafaktual.** Supaya website-settings bisa menjelaskan lonjakan +9,83M ms/hari, satu
   panggilannya harus berharga 92,6 ms. Terukur 0,061 ms. Meleset 1.518×.

**Alasan mekanisnya:** Cloudflare menagih CPU time, **bukan wall time**. Menunggu subrequest ke
api.pmone.id tidak dihitung. Yang dihitung cuma JSON.parse + overhead h3, dan itu receh. Panggilan
API juga **tidak menyebabkan render terjadi** — dia cuma menambah biaya di dalam render yang tetap
akan terjadi.

Kalau seluruh migrasi config dibalik hari ini: hemat **0,17M ms/hari (2,1%) = $0,10/bulan**.
Biayanya: kembali ke rebuild + push tiap ubah setting, di 16 situs. **Jangan.**

### 3.2 Trafik tidak tumbuh

Tabel `visits` produksi (tracking client-side, bukan bot): datar **17.000-27.000/hari** dari
27 Apr sampai 21 Jul, tanpa satu pun lompatan. Termasuk di 24 Jun (23 Jun 18.813 → 24 Jun 20.264).
Jadi lonjakan tagihan bukan karena situsnya makin ramai.

### 3.3 "Titik belok 24 Jun" kemungkinan besar artefak retensi

Tidak ada deploy sama sekali antara 23 Jun 08:22 UTC dan 24 Jun 10:51 UTC, padahal 23 Jun
tercatat 2,24M dan 24 Jun 12,07M. Yang lebih menentukan: data 23 Jun diambil oleh sesi lama pada
23 Jul, tepat di batas retensi 30 hari, jadi **23 Jun adalah hari terpotong**, bukan hari normal
"sebelum lonjakan". Jumlah baris 23 Jun-21 Jul = 373,58M = persis total siklus, artinya 22 Jun
nol baris. Berhenti mencari "apa yang terjadi 24 Jun" — pertanyaannya salah.

### 3.4 Hipotesis `_routes.json` benar, tapi nilainya cuma $0,60 dari $7,52

Terkonfirmasi dari artefak build asli: nitropack memotong keras exclude list jadi 99 entri
(`dist/presets/cloudflare/utils.mjs:72`), dan 99 slot itu habis dimakan 244 PNG bendera, berhenti
alfabetis di `gw.png`. Dari 463 URL precache service worker, 212 tidak ter-cover.

Tapi CPU-nya nol: fix 3-4 Jul (`cc78641`) menghapus ~683k invocation/hari sementara CPU justru
naik 0,7M. Harga per invocation aset statis: **≤0,59 ms**. Jadi `_routes.json` menjelaskan overage
**request** ($0,60), bukan overage **CPU** ($6,92).

### 3.5 Yang benar-benar mahal: jumlah render × biaya render

Dekomposisi kenaikan 237× dari siklus Februari ke siklus Juni-Juli:
**163× dari jumlah request, 1,45× dari biaya per request.** Biaya per invocation Februari 22,05 ms
vs 23 Juni 23,79 ms — praktis sama.

Yang berubah adalah **berapa banyak request yang berujung render penuh**. Sepanjang Juni-Juli
tidak ada lapis cache HTML sama sekali di jalur Worker, jadi tiap request halaman = satu SSR penuh.
Itu saja ceritanya. Semua yang dikerjakan 23-25 Jul adalah membangun lapis itu, dan hasilnya
terlihat di tabel §1.

### 3.6 Insiden 13-18 Jul yang belum pernah dicatat di sini

Commit `c2c25ed` (12 Jul, plan 030) memanggil `useAppConfig()` di dalam computed yang cuma dibaca
`useHead(() => ...)`, jadi dievaluasi di `renderSSRHead` di luar setup → **semua situs 500 di
SSR `/news/{slug}`**. Response 500 = render halaman + render error page, dan tidak pernah masuk
edge cache karena `cacheControl.ts` cuma memasang header di status 200. Biayanya **+3,6M ms/hari
selama 6 hari** (12,03M rata-rata 9-12 Jul → 15,65M rata-rata 13-17 Jul). Fix `0e99c72` (18 Jul),
CPU balik 11,14M pada 19 Jul.

## 4. Sisa masalahnya di mana (data 26-27 Jul)

CPU per worker, 24 jam, total 3,94M ms / 48.808 invocation:

| Worker | CPU | Inv | ms/inv | | Worker | CPU | Inv | ms/inv |
|---|---:|---:|---:|---|---|---:|---:|---:|
| flei | 742k | 12.388 | 60 | | panorama-media | 138k | 1.345 | 103 |
| megabuild | 479k | 5.394 | 89 | | renex | 134k | 755 | 178 |
| icc | 463k | 9.350 | 50 | | panorama-events | 108k | 981 | 111 |
| morefood | 385k | 3.396 | 113 | | pmone | 105k | 657 | 159 |
| inacon | 315k | 3.217 | 98 | | outingexpo | 103k | 1.038 | 99 |
| keramika | 279k | 2.844 | 98 | | campx | 76k | 810 | 94 |
| cafeexpo | 231k | 2.200 | 105 | | iicc | 25k | 345 | 72 |
| icf | 173k | 1.610 | 107 | | monara | 15k | 210 | 71 |
| cokelatexpo | 152k | 1.981 | 77 | | global-ai-expo · levenium · levenium-ui | 19k | 287 | — |

Kuantil (µs), 24 jam yang sama:

| Worker | p50 | p75 | p90 | p99 |
|---|---:|---:|---:|---:|
| flei | 7.059 | 27.632 | 250.608 | 557.747 |
| icc | 6.223 | 19.925 | 172.355 | 587.305 |
| megabuild | 10.591 | 107.442 | 316.277 | 654.341 |
| keramika | 19.792 | 96.330 | 331.329 | 703.784 |

**Ini angka terpenting di seluruh dokumen:** median invocation sekarang 6-20 ms (cache bekerja),
tapi **10% teratas menyumbang ~69% CPU dan 25% teratas menyumbang ~99%**. Diterjemahkan:
**±12.000 render penuh/hari × ±325 ms = praktis seluruh 3,94M.**

Konsekuensi untuk memilih tuas: **berhenti mengoptimasi jalur cache hit.** Yang tersisa cuma dua
angka: berapa banyak render terjadi, dan berapa mahal satu render.


### 4b. Pecahan request per keluarga path — belum pernah diukur sebelumnya

7 dari 16 zona (yang terbesar), 24 jam (26 Jul 18:00 → 27 Jul 18:00 UTC), **filter
`requestSource: "eyeball"`** supaya operasi Cache API worker sendiri tidak ikut terhitung.
Total 927.059 request, 72.415 di antaranya bukan `hit` di CDN.

| Keluarga | Total | Non-hit | Rata-rata | Sampai worker? |
|---|---:|---:|---:|---|
| HTML "lain" | 24.586 | 23.918 | 7 KB | **Sebagian besar TIDAK** (lihat bawah) |
| `_nuxt/**` | 415.527 | 11.379 | 8 KB | Tidak — Static Assets |
| aset statis lain | 444.718 | 10.078 | 18 KB | Tidak — Static Assets |
| 404 | 6.160 | 6.157 | 4 KB | Ya, tapi murah (tidak match route) |
| `cdn-cgi/**` | 6.842 | 5.779 | 20 KB | Tidak — beacon Cloudflare |
| **HTML `/news/{slug}`** | 9.730 | **4.778** | 33 KB | **Ya, render penuh** |
| **HTML `/brands/{slug}`** | 4.310 | **3.982** | 14 KB | **Ya, render penuh** |
| **HTML root `/`** | 6.131 | **3.452** | 128 KB | **Ya, render penuh** |
| `api/**` proxy | 2.486 | 1.949 | 4 KB | Ya, murah |
| `_og/**` (OG runtime) | 662 | 577 | 4 KB | Ya, tapi **volumenya nol praktis** |
| `api/_nuxt_icon` | 3.030 | 177 | 1 KB | Ya, murah |
| `/news` (list) | 180 | 137 | 31 KB | Ya |
| fonts | 2.697 | 52 | — | Tidak |

**Bucket "HTML lain" itu menyesatkan dan wajib dibongkar.** Isinya di 4 zona terbesar
(17.124 non-hit) per status: **403 = 11.892 (69%)**, 301 = 2.228, 409 = 1.457,
**200 = 1.409 (8%)**, 307 = 101. Jadi 84% bucket itu adalah **blokir WAF dan redirect www yang
tidak pernah menyentuh worker sama sekali**. Halaman HTML sungguhan di dalamnya cuma ±1.400.

Angka 403 itu kabar baik: **WAF membunuh ±12.000 request/hari di 4 zona sebelum worker jalan.**
Nol CPU, nol tagihan.

**Komposisi render sungguhan** (setelah semua yang tidak menyentuh worker dibuang):

| Halaman | Non-hit/hari (7 zona) | Share |
|---|---:|---:|
| `/news/{slug}` | 4.778 | 33% |
| `/brands/{slug}` | 3.982 | 27% |
| root `/` | 3.452 | 24% |
| halaman statis lain (200) | ±2.000 | 14% |
| `/news` list | 137 | 1% |

Halaman terpanas tunggal: `franchise-expo.co.id/id/book-space` (611 request 37 KB + 126 request
135 KB per hari).

⚠️ **`_og/**` DIUKUR DAN HASILNYA NOL.** Sintesis menempatkan rasterisasi OG sebagai kandidat
biaya terbesar yang belum terukur. Sudah diukur: 662 request/hari di 7 zona (0,8% non-hit), dan
semua `og:image` di produksi menunjuk ke `cdn.pmone.id` (media Spatie yang sudah jadi), bukan ke
render runtime. Coret dari daftar. Catatan cara mencari: pola pathnya `/_og/`, jadi regex
`/og/` TIDAK akan menemukannya.

Konsekuensi untuk §5: `/news/{slug}` + `/brands/{slug}` + root `/` = **84% render**. Ketiganya
di-cover cache dan ketiganya kena masalah `Set-Cookie` di §5.1. Itu memperkuat §5.1 sebagai
tuas tunggal terbaik, dan melemahkan opsi prerender parsial yang cuma menyentuh halaman statis.

## 5. Tuas yang tersisa, diurut berdasarkan hasil dibagi effort

### 5.1 Berhenti mengirim `Set-Cookie` pada render yang cacheable — SATU BARIS, tuas terbesar

Probe terkontrol 28 Jul, URL segar, colo SIN:

```
req1  edge=MISS  cdn=-    set-cookie=1     <- render 150-350 ms, CDN MENOLAK menyimpan
req2  edge=HIT   cdn=HIT  set-cookie=0     <- baru di sini CDN menyimpan
req3-6 edge=HIT  cdn=HIT  set-cookie=0
```

Biayanya persis **satu render terbuang per URL per colo**. Cache API ada di dalam worker dan
bersifat per-colo tanpa tiering; CDN punya tiering tapi tidak pernah menerima render pertama
karena membawa `Set-Cookie: i18n_locale`.

`cacheControl.ts:176-180` sudah men-strip cookie itu dari salinan yang masuk Cache API, lengkap
dengan komentar yang menjelaskan kenapa itu aman (di URL cacheable, locale sudah ada di path).
**Alasan yang sama persis berlaku untuk response yang dikirim ke visitor.** Jadi ini bukan
hack baru, ini menuntaskan yang sudah setengah jalan.

Estimasi: render turun dari ±1 per colo jadi ±1 global per TTL. Dengan tiered cache aktif di
28 zona dan salinan CDN terbukti hidup 68 jam, ini realistis memangkas render 60-80% →
**CPU 4,0M → 0,8-1,6M ms/hari**. Itu ambang $5,00.

Drawback jujur: visitor yang mendarat langsung di URL ber-prefix locale tidak lagi menerima
cookie `i18n_locale`, jadi kalau nanti dia buka `/` telanjang, negosiasinya balik ke
`Accept-Language`. Pilihan locale manual lewat switcher tetap tersimpan (di-set client-side).
Reversible dalam satu deploy.

**Cara verifikasi:** deploy, tunggu 48 jam tanpa deploy lain, banding ke baseline 3,94M ms /
48.808 invocation (26 Jul 18:00 → 27 Jul 18:00 UTC).

### 5.2 `PostRelated` jangan SSR — satu opsi, halaman terpanas

`layers/base/app/components/blog/PostRelated.vue:142` menarik 21 post lewat `useLazyFetch` saat
SSR, merender 20 kartu, dan menyerialisasi ±46 KB ke `__NUXT_DATA__` — untuk grid "You might
also like" di paling bawah halaman yang sudah punya guard `v-if="!pending && ..."`.
`/news/{slug}` adalah keluarga HTML terbesar di akun (21.689 request/hari, 1.847 URL).

Tambahkan `server: false`. Estimasi 20-40 ms dari render ±105 ms di halaman itu.

### 5.3 Matikan minifier `nuxt-seo-utils` — satu baris, nol risiko

`nuxt-seo-utils` menjalankan minifier JS/CSS/JSON di setiap tag inline pada tiap render produksi
(default `minify: true`). Manfaatnya nol di sini: blok `ld+json` sudah hasil `JSON.stringify`,
skrip color-mode sudah diminify bundler. ±1-3 ms per render = 0,6-1,9%.

### 5.4 Gabung tiga panggilan `/api/banners` jadi satu

Homepage menembak `/api/banners` tiga kali terpisah (placement `hero-announcement`, `hero`,
`visitor-cta`) di `Announcement.vue:35`, `BannerHero.vue:278`, `VisitorCta.vue:189`. Butuh
dukungan backend untuk multi-placement. ±10 ms per render homepage.

### 5.5 Prerender/SSG — jangan sekarang

Angka yang dihitung ulang dengan baseline hari ini (4,0M/hari, bukan 7,9M): prerender agresif
memangkas invoice dari ≈$6,88 ke ≈$5,20, **hemat ±$1,70/bulan**. Itu hasil yang sama dengan §5.1
yang cuma satu baris. Total 9.308 URL publik di 16 situs, 82% di antaranya `/news/{slug}` (4.393)
dan `/brands/{slug}` (3.296) — persis dua famili yang paling sering diedit staff.

Varian "aman" (prerender cuma halaman yang jarang berubah) adalah yang **paling buruk**:
1.619 URL, 4-6% CPU, semua kerumitan build tanpa hasil.

Ancaman build yang sesungguhnya bukan build minutes (63-75 menit per deploy penuh dari kuota
6.000/bulan) tapi fan-out OG image: `nuxt-og-image` mengantre satu render OG per halaman
prerendered; 9.308 halaman × 3,1 detik = 481 menit dan app besar pasti timeout.

**Keputusan: kerjakan §5.1 dulu. Kalau §5.1 gagal, baru buka lagi topik ini.**

### 5.6 Payload/render cost — pintu yang user tutup, catat saja

HTML produksi hari ini: keramika home 457 KB (`__NUXT_DATA__` 93 KB, 84 KB inline SVG di 49 tag),
flei home 400 KB (86 KB / 92 KB), ICC artikel 242 KB (67 KB / 91 KB).

Inline SVG 84-92 KB per halaman itu besar, dan `icon.mode: 'css'` adalah satu baris config. Tapi
user sudah menutup topik payload setelah insiden 24 Jul (trim allowlist merusak gambar posts) dan
revert diet logo 25 Jul. **Jangan diusulkan lagi tanpa diminta.** Dicatat di sini supaya sesi
berikutnya tahu angkanya, bukan supaya dikerjakan.

## 6. Tiga hal yang rusak dan tidak berhubungan dengan tagihan

### 6.1 View count artikel undercount ±80% sejak edge cache hidup

`GET /public/blog/posts/{slug}` mencatat `Visit` di sisi server dan sengaja tidak di-response-cache
(`routes/api.php:1551` — komentar "No cache - has trackVisit"). Begitu HTML `/news/**` dilayani
dari edge cache, render tidak terjadi, panggilan upstream tidak terjadi, **view tidak tercatat**.

| Periode | Visit `App\Models\Post` /hari |
|---|---:|
| 19-21 Jul | 23.300 |
| 24-26 Jul | 4.359 |

Tipe lain datar di periode yang sama (banner impression 1.053 → 870, brand visit 216 → 182),
jadi ini bukan penurunan trafik — ini perubahan makna metrik. Angka view di dashboard PM One
sekarang menghitung **cache miss**, bukan pembaca, dan akan makin kecil kalau §5.1 dikerjakan.

Butuh keputusan produk. Opsi termurah: pindahkan pencatatan view ke beacon client-side, sejalan
dengan `useBannerTracking`/`useBrandTracking` yang sudah client-side dan tidak terpengaruh.

### 6.2 ~~Cache 404 HTML tidak jalan~~ — KLAIM SALAH, dikoreksi 28 Jul

Entri ini semula melaporkan cache 404 mati berdasarkan empat request berturut yang semuanya
`x-edge-cache: MISS`. **Pengukurannya yang salah, bukan kodenya.**

`curl` tanpa header `Accept` mengirim `*/*`, dan `00.edge-cache.ts:126-128` memang SENGAJA
menolak melayani 404 ter-cache ke klien yang tidak minta HTML (`wrongFormat`). Alasannya
tertulis di komentar: entri tersimpan itu halaman error bermerek, sedangkan klien JSON dapat
error JSON yang murah. Jadi probe apa pun tanpa `Accept: text/html` akan **selalu** terlihat
MISS.

Diuji ulang dengan header browser sungguhan:

```
req1 404 edge=MISS
req2 404 edge=MISS
req3 404 edge=HIT   age=1
req4 404 edge=HIT   age=2
```

Path acak tanpa pola route bahkan HIT di request kedua. **Cache 404 bekerja. Tidak ada yang
perlu diperbaiki, dan penangkap `/__nuxt_error` TIDAK boleh dihapus.**

⚠️ Aturan probe yang harus dipakai seterusnya: verifikasi cache 404 **wajib** mengirim
`-H 'Accept: text/html,application/xhtml+xml,...'`. Tanpa itu hasilnya menyesatkan, dan
kekeliruan ini sudah memakan satu putaran investigasi.

### 6.3 `/tickets` di-cache 7 hari padahal merender stok tiket live

`cf-cache-rules.ts` memberi `/tickets` TTL panjang, dan tidak ada satu pun jalur order yang
membersihkan tag `tickets`. Stok bisa basi seminggu. **Ini bug korektnes, bukan performa.**
Perbaikan termurah: turunkan `/tickets` ke 60-300 detik, atau bikin `TicketOrder` membersihkan
tag `tickets` saat order dibayar.

## 7. Utang kode dari kampanye 21-25 Jul — penilaian jujur

Kampanye menambah ±1.113 baris di pmone-events dan ±866 baris di pmone. Hasilnya nyata (−78% CPU),
tapi nilainya terkonsentrasi di **±150 baris**: lookup di middleware, store di plugin, tabel TTL.

| Artefak | Nilai | Vonis |
|---|---|---|
| Lookup middleware + store plugin + `getEdgeCache()` guard | −10,2M ms/hari | **WAJAR, pertahankan** |
| `pmOneFetch`/`resolveEventSlug`/`streamUpstreamPdf` (25 Jul) | −914 baris bersih, tutup lubang query passthrough lintas project, timeout untuk 24 route | **WAJAR, sering dikira bagian kekacauan padahal ini pembersihan** |
| Wrap `res.end` untuk menangkap 302 di `/` | 32 baris monkey-patch, satu path, **tidak pernah terukur** | **HACKISH** — perbaikan lebih bersih: berhenti me-redirect `/` sama sekali |
| Capture `/__nuxt_error` | bersandar 3 internal Nuxt tak berdokumen, tapi **terbukti bekerja** (§6.2) | **BATAS** — rapuh, tapi membayar dirinya; jangan dihapus |
| `EdgeCache::homeVariantUrls()` di pmone | menyalin skema cache key repo lain dengan tangan, nol test | **HACKISH karena posisinya** — minimal butuh satu Pest test yang mengunci kontrak |
| TTL detail 30 hari | nol manfaat (tidak ada entri sepanjang itu), radius ledakan sebulan | **BUANG** — turunkan ke 7 hari, angka CPU tidak akan bergerak |
| `$project` selalu null di purge | nol model mengimplementasi `edgeCacheProject()` → satu save artikel mem-purge ±1.216 URL lewat ±56 panggilan API | **PERBAIKI** — tambahkan `edgeCacheProject()` di Post/Brand |
| Bot-variant collapse (`BOT_UA_RE`) | argumen benar tapi halus, tidak pernah diukur sendirian | **BATAS** |

## 8. Konfigurasi yang HIDUP di dashboard Cloudflare per 28 Jul

Ini satu-satunya catatan; tidak ada di git. Akun `3797ae01f7dfb6dffb5a1b3f82713c33`, **28 zona,
semuanya plan Free**.

| Setting | Cakupan |
|---|---|
| Smart Tiered Cache | **ON di 28 zona (semua)** |
| AI bot policy | 28 zona: `ai_training=block`, `ai_search=allow`, `ai_user=allow`, `fight_mode=false` |
| Cache Rule "Respect origin Cache-Control (edge cache SSR + API)" | 26 zona — **`askindo.id` TIDAK punya** (perlu dicek, `iicc.askindo.id` menumpang di sana) |
| WAF `block-cms-scanners` | 28 zona |
| WAF `block-seo-scrapers` | 14 zona |

WAF memblok **25.022 request/hari** di 6 zona terbesar yang diukur — itu invocation yang tidak
pernah terjadi dan tidak pernah ditagih.

Cara membaca ulang tanpa token: buka `dash.cloudflare.com` di Chrome (user sudah login), lalu
`fetch('/api/v4/...', {credentials:'include'})` dari konteks halaman. Token
`CLOUDFLARE_EDGE_PURGE_TOKEN` di `.env` cuma punya Cache Purge + Zone Read.

⚠️ Zona Free tidak punya dimensi `coloCode` dan `edgeResponseContentTypeName` di
`httpRequestsAdaptiveGroups` — query yang memakainya akan gagal dengan error `authz`.
Retensi dimensi `scriptName` di `workersOverviewRequestsAdaptiveGroups` cuma beberapa hari;
untuk tanggal lama hasilnya `__unknown__`.

## 9. Sumber data yang dipakai di entri ini

- Cloudflare GraphQL: `workersOverviewRequestsAdaptiveGroups`, `workersInvocationsAdaptive`,
  `httpRequestsAdaptiveGroups`.
- `GET /api/v4/accounts/{id}/paygo-usage` — satu-satunya angka billing yang otoritatif.
- Database produksi (read-only, tunnel `db-tunnel` → MCP postgres): tabel `visits` (retensi
  ±3 bulan) dan `api_consumer_requests` (retensi ±30 hari). **`visits` yang bertipe
  `App\Models\Post` adalah proxy langsung jumlah render `/news/{slug}`** — retensinya jauh lebih
  panjang dari analytics Cloudflare, pakai itu kalau butuh sejarah.
- Probe `curl -sS -o /dev/null -D -` (GET, jangan HEAD) ke situs live.

---

# 28 Jul 2026 — perubahan yang di-deploy

Dikerjakan setelah audit di atas. Semua mendarat dalam satu push, jadi efek masing-masing
TIDAK bisa dipisahkan; ukur gabungannya terhadap **3,94M ms / 48.808 invocation**
(26 Jul 18:00 → 27 Jul 18:00 UTC). Gate: < 2,0M ms/hari.

## 1. Render cacheable berhenti mengirim `Set-Cookie` (tuas utama)

`layers/base/server/plugins/cacheControl.ts` → helper `stripSetCookie()`, dipanggil di cabang
`if (cacheControl)`. Render segar sekarang memenuhi syarat CDN, jadi Smart Tiered Cache bisa
menyebarkan satu render ke semua colo alih-alih tiap colo membayar render sendiri.

Diverifikasi di dev (keramika):

| Route | Sebelum | Sesudah |
|---|---|---|
| `/news`, `/privacy`, `/brands`, `/api/event/website-settings` | `set-cookie` ada | **nol** |
| `/tickets/checkout` (tidak cacheable) | ada | **tetap ada** |
| `/` + `Accept-Language: id` | 302 + cookie | **302 + cookie, tidak berubah** |
| `/` + cookie `i18n_locale=id` | 302 → `/id` | **302 → `/id`, tidak berubah** |

Negosiasi locale utuh: yang mengirim cookie adalah redirect 302, dan handler sudah return
duluan untuk status bukan 200.

⚠️ Produksi mengirim **dua** cookie, bukan satu: `i18n_locale` dan `brands-view-mode` di
`/brands`. Yang kedua cuma default `"grid"` yang ditulis SSR (`useBrandsListing.js:59`),
nilainya fallback ke `grid` kalau absen, dan toggle ke list ditulis browser. Aman.
**Cookie per-visitor BARU di route cacheable tidak boleh mengandalkan response ini.**

## 2. Biaya per render

- **`PostRelated` jadi `server: false`.** `useLazyFetch` tetap jalan di server (lazy cuma
  berarti non-blocking), jadi tiap render `/news/{slug}` menarik 21 post, merender 20 kartu,
  dan menyerialisasi ±46 KB ke `__NUXT_DATA__` untuk grid di bawah fold. Diverifikasi di dev:
  markup related dan payload `blog/posts` **nol** di HTML SSR, halaman tetap 200.
  SEO: 20 link internal hilang dari HTML. Discovery aman, semua post ada di sitemap dan
  ditautkan dari `/news` yang tetap SSR.
- **`seo.minify.runtime: false`** di `layers/base/nuxt.config.ts`. `nuxt-seo-utils` memasang
  hook unhead `ssr:render` yang me-minify ulang tiap `<script>`/`<style>` inline setiap render.
  Nol manfaat: tiga blok `ld+json` sudah hasil `JSON.stringify`, skrip color-mode sudah
  diminify bundler. Bagian `build` dibiarkan menyala (jalan sekali, gratis).
  Catatan: plugin nitro `minifyHtml` milik modul yang sama early-return kecuali
  `import.meta.prerender`, jadi selama ini memang mati.

## 3. Bug stok tiket basi — DIPERBAIKI

Akarnya bukan TTL, tapi event Eloquent yang tidak pernah jalan. `Ticket::reserve()`,
`TicketPricePhase::reserve()`, `TicketSession::reserve()` (dan `release()` masing-masing)
memindahkan stok lewat `static::query()->update()` / `->decrement()` demi konkurensi, dan itu
**tidak memicu `saved`**, jadi `ClearsResponseCache` tidak pernah kena. Tiket sold out tetap
tampil tersedia sampai TTL 7 hari habis.

- pmone: helper baru `ClearsResponseCache::clearResponseCacheForRawUpdate()`, dipanggil dari
  keenam method itu **hanya kalau baris benar-benar berubah**.
- events: `/tickets` turun dari `HTML_TTL` (7 hari) ke `HTML_TTL_LIVE` (1 jam) sebagai jaring
  pengaman kalau purge gagal. Biayanya nol praktis, halaman itu cuma dapat ratusan request/hari.
- Test baru `tests/Feature/Tickets/TicketStockCacheInvalidationTest.php`, **8 hijau**. Ini juga
  test pertama yang menyentuh `PurgeEdgeCache` sama sekali.

`/hotels` dicek dan **tidak** punya bug yang sama: tidak ada `increment`/`decrement` di jalur
reservasi, jadi perubahannya lewat save Eloquent normal.

## 4. View count artikel pindah ke beacon browser — DIPERBAIKI

Dulu dihitung server-side di `PublicBlogController::post()`, dan route-nya sengaja tidak
di-response-cache supaya penghitungnya jalan. Begitu `/news/{slug}` di-edge-cache, HIT berarti
tidak ada render, tidak ada panggilan upstream, tidak ada baris. 23.300/hari → 4.359/hari dalam
tiga hari, sementara banner dan brand (keduanya sudah client-side) datar.

- pmone: `Post::class` masuk `TRACKABLE_TYPES`; `TrackingHelper::trackVisit` dihapus dari
  controller; route `/public/blog/posts/{slug}` sekarang `CacheResponse::for(3600, 'blog-posts')`.
- events: composable baru `usePostTracking.ts` (pola sama dengan `useBannerTracking` /
  `useBrandTracking`), dipanggil dari `news/[slug].vue` lewat `onMounted` **dan** `watch` pada
  `post.id` — komponen `[slug].vue` bertahan saat navigasi antar artikel, jadi `onMounted` saja
  cuma menghitung artikel pertama per sesi.
- events: `server/api/blog/posts/[slug].get.ts` jadi `defineCachedEventHandler`
  (`maxAge: 15`, `swr: false`, key slug+locale) karena efek sampingnya sudah hilang.
- Test `PublicBlogApiTest` "viewing post increments visit count" diganti dua test yang mengunci
  kontrak baru. **25 hijau** bersama `TrackingValidationTest`.

Rantai beacon diuji end to end di dev: `POST /api/track/visit` dengan `App\Models\Post`
menembus proxy ke Laravel dan menulis baris.

**Konsekuensi yang harus diberitahukan ke staff:** angka view akan turun lagi karena bot tidak
menjalankan JavaScript. Itu perbaikan akurasi, tapi grafiknya akan patah di tanggal deploy.
Efek samping bagus: `/public/blog/posts/{slug}` tadinya satu-satunya endpoint publik bervolume
yang tidak ter-cache, ±3.000 round trip origin/hari dari total ±6.000.

## 5. Klaim "cache 404 mati" DIBATALKAN — lihat §6.2 di entri sebelumnya

Probe-nya yang salah, bukan kodenya. Tidak ada perubahan kode.

## Yang HARUS diukur setelah deploy

**Di-push 28 Jul 2026 01:08 UTC / 08:08 WIB** (pmone `6eac70e9`, pmone-events `df6c50b`).
Build Cloudflare untuk 16 app jalan setelah itu, jadi **jendela ukur bersih mulai 28 Jul
03:00 UTC** (jam penuh setelah build + refill cache selesai).

1. Deploy me-reset seluruh cache HTML lewat validasi `x-edge-build`, jadi jam-jam pertama
   selalu tinggi dan tidak sah dipakai.
2. H+2, banding ke 3,94M ms / 48.808 invocation. Gate < 2,0M ms/hari.
3. Probe `Set-Cookie` di produksi: request PERTAMA ke URL segar harus tanpa `set-cookie`, dan
   `cf-cache-status` tidak lagi kosong. Itu bukti tuas §1 bekerja.
4. Cek `visits` bertipe `App\Models\Post` di DB produksi naik lagi setelah deploy. Kalau tetap
   nol, beacon-nya tidak jalan di produksi.
5. Verifikasi visual `/news/{slug}`: grid "You might also like" harus muncul setelah hydration.
   Belum bisa dicek di sesi ini, extension Chrome tidak terhubung.
