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
| 2026-07-23 | 2/31 | — | — | — | **Hari perbaikan.** WAF anti-scanner aktif di 27 zone (±18.600 invocation/hari hilang). Edge cache in-worker di-deploy ke 16 app. `browser_cache_ttl` 27 zone diubah 120 → 0. Backend purge-by-URL live & terverifikasi end-to-end. Angka hari ini campuran sebelum/sesudah — baseline bersih mulai 24 Jul. |

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

- **H+1 (24 Jul):** CPU harian harus **< 3M ms**. Kalau tidak → periksa hit-rate `x-edge-cache`.
- **H+3 (26 Jul):** CPU harian **< 1,2M ms** dan HIT-rate > 85% di halaman teratas.
- **H+7 (30 Jul):** kumulatif on-track untuk < 30M ms. Kalau tidak → mulai fase optimasi payload
  (HTML home 340 KB: `__NUXT_DATA__` 98 KB + inline SVG 93 KB), yang sengaja ditunda.

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
