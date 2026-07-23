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

## Gate keputusan

- **H+1 (24 Jul):** CPU harian harus **< 3M ms** (gate transisi — cache masih mengisi). Kalau
  tidak → periksa hit-rate `x-edge-cache`.
- **H+3 (26 Jul):** CPU harian **< 1,2M ms** dan HIT-rate > 85% di halaman teratas.
- **H+7 (30 Jul):** CPU harian mapan **< 1M ms**. Kalau tidak → mulai fase optimasi payload
  (HTML home 340 KB: `__NUXT_DATA__` 98 KB + inline SVG 93 KB) untuk memangkas biaya per-render
  dari ±150 ms.

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
