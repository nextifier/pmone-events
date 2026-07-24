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
diet logo (icc `<img>` −82 KB/halaman artikel; megabuild/renex CSS mask; flei mark) ·
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

## Cek cepat tanpa dashboard

```bash
for i in 1 2 3; do curl -sSI https://indonesiacomiccon.com/id/news/urutan-film-marvel \
  | grep -iE 'cf-ray|x-edge-cache'; done
```

`x-edge-cache: HIT` = dilayani cache (±3 ms CPU). `MISS` = render penuh (150–350 ms).
`SKIP` = memang tidak boleh di-cache (mis. `/`, checkout, tracking).

⚠️ **Cache API bersifat per-colo.** MISS pertama di tiap colo (SIN, HKG, CGK…) itu normal dan
bukan tanda caching gagal — perhatikan `cf-ray` untuk tahu colo mana yang melayani. Bukti entri
cache sungguhan adalah header `age` yang bertambah antar-request.
