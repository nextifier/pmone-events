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
