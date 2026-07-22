# Plan: Turunkan Workers CPU dari 373M → <30M ms/siklus + invalidasi cache dari dashboard PM One

Status: **belum dieksekusi** · Dibuat 23 Juli 2026 · Target selesai sebelum 22 Agustus 2026 (akhir siklus billing)

## Context

Tagihan Cloudflare akun `Nextifier@gmail.com` (`3797ae01f7dfb6dffb5a1b3f82713c33`) melonjak dari
$5,00 menjadi **$12,52** di invoice 22 Juli 2026 ($5 langganan + $6,92 Workers CPU + $0,60 requests).
Siklus 22 Jun – 22 Jul 2026 memakai **373.604.916 ms CPU** dari kuota gratis 30.000.000 ms.

Analisa lengkap ada di `~/Frontend/pmone-events/docs/cf-cpu-investigation-2026-07.md`. Ringkasnya:

- **Akar masalah:** HTML hasil SSR tidak pernah masuk cache edge. Setiap request halaman =
  1 invocation + 1 full Nuxt SSR (±150–350 ms CPU). 12–18M ms/hari vs kuota 1M ms/hari.
- Cache Rule zone `respect-origin-cache-control` **ada** dan header `s-maxage=300` **ada**, tapi
  tidak berefek: di urutan trafik Cloudflare **Worker berjalan sebelum cache**, jadi Cache Rule
  hanya mengatur `fetch()` subrequest — bukan response yang dihasilkan Worker. Terbukti:
  `curl -I https://indonesiacomiccon.com/id/news/urutan-film-marvel` sama sekali **tidak punya
  header `cf-cache-status`**, sedangkan `/favicon.ico` → `cf-cache-status: HIT`.
- Waktu masih preset `cloudflare-pages`, Cache Rule masih bekerja (log 14 Jul: `/news` HIT,
  cache rate 53%). Migrasi ke `cloudflare_module` pada 21 Jul (commit `4e91d3c`, `db60b74`)
  mematikannya → CPU/request naik 84 ms → 145 ms.
- 19% invocation adalah scanner WordPress/PHP (±18.600/hari) dan 13% adalah
  `/api/_nuxt_icon/*.json` yang **semuanya membalas `204` kosong** (±12.966/hari).

Hasil yang diinginkan: siklus Agustus 2026 dan seterusnya kembali **$5,00** tanpa tambahan
Workers CPU, **dan** setiap perubahan data di dashboard PM One langsung tercermin di 20+ website
event tanpa menunggu TTL atau rebuild.

## Keputusan yang sudah disepakati (23 Jul 2026)

| Topik | Keputusan |
|---|---|
| Halaman konten (`/news/*`, `/brands/*`, `/guests/*`) | **SSR + edge cache (Cache API) + purge**. Konten tetap ada di HTML awal (SEO aman). Tidak di-prerender. |
| Rebuild otomatis dari dashboard | **Tidak ada.** Rebuild murni dari git push (perubahan kode). |
| 11 halaman prerendered saat ini (`/privacy`, `/terms`, `/contact`, dll) | **Pindahkan ke SSR + cache.** Prerender dibuang supaya tidak ada satu pun trigger rebuild dari konten. |
| Cara purge | **Purge by URL spesifik**, dengan fallback `purge_everything` per zone hanya untuk perubahan global (Website Settings / appearance / copy). |
| TTL fallback kalau purge gagal | **1 jam** untuk HTML; API lebih pendek. |
| WAF | **Blokir scanner WordPress/PHP** (`/wp-*`, `*.php`, `/.env`, `/.git`) di semua zone. Bot Fight Mode & blokir AI crawler: TIDAK. |
| Rollout | **Langsung semua** 16 app pmone-events + 27 zone. |
| Optimasi ukuran HTML (payload 98 KB, inline SVG 93 KB) | **Fase terpisah**, di luar plan ini. |

## Constraint & fakta teknis yang sudah diverifikasi

- **h3 1.15.11** (`node_modules/.../h3/dist/index.mjs:2017-2031`): handler middleware yang
  mengembalikan nilai akan menghentikan request, dan `isWebResponse(val) → sendWebResponse`
  (baris 2104). Jadi **middleware Nitro boleh `return` sebuah `Response` dari Cache API.** ✅
- Nitro 2.13.4 mendaftarkan `server/middleware/*` lewat `h3App.use()`
  (`nitropack/dist/runtime/internal/app.mjs:119-124`) → jalur di atas berlaku.
- `event.waitUntil()` tersedia di Nitro/Workers → aman untuk `cache.put()` setelah response.
- `caches.default` (Cache API) **adalah** cache zone Cloudflare, jadi entri-nya bisa dihapus
  lewat purge-by-URL biasa. Tidak butuh Enterprise.
- Deploy: **Workers Builds dari GitHub** (`preset: cloudflare_module`, `deployConfig: true`,
  `assets` binding — lihat `apps/megabuild/.output/server/wrangler.json`). Push ke `main` =
  build semua app. Runbook: `~/Herd/pmone/MIGRATION_WORKERS.md`.
- Backend `~/Herd/pmone` **sudah punya** infrastruktur purge yang bisa dipakai ulang:
  - `app/Support/CloudflareCache.php` — wrapper HTTP purge (saat ini `purge_everything`, 1 zone).
  - `app/Jobs/PurgeCloudflareCache.php` — job unik + debounce 10 detik.
  - `app/Listeners/PurgeCloudflareCacheOnResponseCacheCleared.php` — hook ke `ClearedResponseCacheEvent`.
  - `app/Traits/ClearsResponseCache.php` — dipakai **31 model** (`Brand`, `Post`, `Guest`,
    `Ticket`, `RundownItem`, `Program`, `Partner`, `Faq`, `Hotel`, `Project`, `WebsiteCopy`, …).
  - Total ±109 call-site `ResponseCache::clear($tags)`.
  - **Batasan:** `Spatie\ResponseCache\Events\ClearedResponseCacheEvent` **tidak membawa tag**
    (kelasnya kosong) → butuh jalur baru untuk purge yang sadar-tag. `ResponseCache` bukan
    `final`, di-bind sebagai `$this->app->singleton('responsecache', ResponseCache::class)`,
    constructor-nya auto-wirable → **bisa di-`extend()`**.
- Frontend sudah punya pola client-side fetch: `server: false` di
  `layers/base/app/composables/useBrandPreview.ts`, `useRundownVisibility.ts`, `useBrandsListing.js`.
- Tabel TTL/route yang sudah ada dan HARUS dipakai ulang:
  `layers/base/shared/cf-cache-rules.ts` (`resolveCacheControl()`, `CACHED_HTML_EXACT`,
  `CACHED_HTML_PREFIX`, `CACHED_GLOBAL_EXACT`, `CACHED_GLOBAL_PREFIX`).
- Pemetaan app → project → domain sudah ada di kode:
  `apps/*/app/app.config.ts` (`projectUsername`, `dataSourceUsername`) dan
  `apps/*/nuxt.config.ts` (`runtimeConfig.public.siteUrl`).
  **Perhatian fan-out:** `cokelatexpo` dan `icf` memakai `dataSourceUsername: "cbe"`, jadi
  perubahan di project `cbe` harus mem-purge cafeexpo **dan** cokelatexpo **dan** icf.

### Risiko yang harus ditangani saat implementasi

1. **Color mode ikut mengubah HTML.** `@nuxtjs/color-mode` pakai `storage: "cookie"` +
   `classSuffix: ""` → SSR memancarkan `<html class="dark">` atau `class="light"` sesuai cookie
   `events-color-mode`. Cache key **wajib** menyertakan varian ini, kalau tidak pengunjung
   light-mode bisa dapat HTML dark-mode.
2. **`set-cookie: i18n_locale` di setiap response HTML.** Cache API menolak menyimpan response
   ber-`Set-Cookie` → header itu harus dihapus sebelum `cache.put()`. `/` sendiri tidak pernah
   di-cache (`resolveCacheControl` mengembalikan `undefined`), jadi cookie tetap ter-set di sana.
3. **`detectBrowserLanguage.redirectOn`.** Base layer memakai `"all"`, sebagian app override ke
   `"root"`. Dengan `"all"` + `alwaysRedirect: true`, halaman ber-prefix locale bisa redirect
   tergantung cookie → tidak cocok dengan caching. Harus diseragamkan ke `"root"`.
4. **Membuang prerender = OG image jadi dinamis.** `nuxt-og-image` mem-prerender OG untuk route
   yang di-prerender (`/_og/s/*`); tanpa prerender ia jatuh ke `/_og/d/**` dengan renderer
   `takumi` yang **sangat mahal CPU**. Store step edge-cache harus ikut menyimpan `/_og/**`
   (module itu sudah menyetel `cache-control` 30 hari sendiri).
5. **Jangan pernah cache** `/api/track/**`, `/api/forms/*/check`, alur `/tickets/**` di luar
   halaman index, `/hotels/**` reservasi, dan semua non-GET. Tabel `resolveCacheControl` sudah
   konservatif — jangan dilonggarkan tanpa audit.

---

## Fase 0 — Prasyarat & pencatatan (sebelum menyentuh kode)

**0.1 Memory + monitoring (dikerjakan Claude, tidak bisa di plan mode)**
- Tulis memory `cf-workers-cpu-overrun-2026-07` (type: `project`) — ringkasan akar masalah,
  angka kunci, dan pointer ke plan ini + `docs/cf-cpu-investigation-2026-07.md`. Konteks ini
  wajib bertahan lintas sesi sampai masalah benar-benar selesai.
- Tulis memory `cf-worker-runs-before-cache` (type: `reference`) — fakta bahwa Cache Rule zone
  TIDAK bisa meng-cache response Worker; satu-satunya jalan adalah Cache API di dalam worker.
  Ini pengetahuan yang mudah terlupakan dan mahal kalau salah lagi.
- Tambahkan dua baris pointer di `MEMORY.md`.
- Buat cron harian (`CronCreate`) selama ±30 hari: tarik `paygo-usage` + GraphQL, tulis baris
  baru ke `~/Frontend/pmone-events/docs/cf-cpu-daily-log.md`, dan beri peringatan kalau
  CPU kumulatif siklus > 20M ms atau CPU harian > 1,2M ms.
- Salin plan ini ke `~/Frontend/pmone-events/docs/` supaya hidup bersama kodenya.

**0.2 Prasyarat manual (user)**
- Buat **satu Cloudflare API token** dengan permission: `Zone → Cache Purge → Edit` dan
  `Zone → WAF → Edit`, di-scope ke **semua zone** akun. Token lama `CLOUDFLARE_PURGE_TOKEN`
  di `~/Herd/pmone/.env` hanya untuk satu zone (`CLOUDFLARE_ZONE_ID`).
- Buat token kedua read-only `Account → Account Analytics → Read` untuk cron monitoring
  (supaya tidak bergantung sesi browser).
- Tambahkan **Budget alert** Workers CPU di 25M ms per siklus.

---

## Fase 1 — Quick wins, risiko nol (target: hari 1, ±30% invocation hilang)

**1.1 WAF: blokir scanner** — 27 zone, via API `PUT /zones/{id}/rulesets/phases/http_request_firewall_custom/entrypoint`.
Ekspresi (WAF dievaluasi **sebelum** Worker → invocation benar-benar nol dan gratis):
```
(http.request.uri.path contains "/wp-") or
(http.request.uri.path contains "/wp-json") or
(http.request.uri.path contains "xmlrpc") or
(ends_with(http.request.uri.path, ".php")) or
(http.request.uri.path contains "/.env") or
(http.request.uri.path contains "/.git")
```
⚠️ `PUT .../entrypoint` **mengganti** seluruh ruleset phase itu — `GET` dulu, gabungkan kalau
sudah ada rule lain. Pola dan peringatan yang sama sudah didokumentasikan di
`docs/cloudflare-cache-rule.md`.

**1.2 `/api/_nuxt_icon/*` — DIBATALKAN (temuan awal salah).** Analisa pertama menyimpulkan
endpoint ini "balas `204` kosong" berdasarkan `curl` tanpa query string. Faktanya ia menerima
`?icons=a,b,c` dan mengembalikan `200` berisi data ikon asli. Mematikannya lewat
`icon.fallbackToApi: false` akan menghilangkan ikon yang nama koleksinya datang dari data
dashboard. **Tidak ada perubahan di sini** — 12.966 request/hari itu diserap Fase 2 (Cache API);
response-nya sudah membawa `cache-control: s-maxage=604800`.

**1.3 Seragamkan i18n** — set `detectBrowserLanguage.redirectOn: "root"` di
`layers/base/nuxt.config.ts` dan audit 16 `apps/*/nuxt.config.ts` agar tidak ada yang `"all"`.

**1.4 404 `/_nuxt/*` murah** — request ke chunk lama (±3.100/hari) jangan sampai me-render
halaman error SSR. Tangani lewat middleware edge-cache (Fase 2) dengan short-circuit
`/_nuxt/*` yang tidak match asset → `404` polos.

---

## Fase 2 — Edge cache di dalam Worker (inti penghematan)

**2.1 File baru `layers/base/server/middleware/00.edge-cache.ts` (lookup)**
- Lewati kalau `event.method !== "GET"` atau `globalThis.caches?.default` tidak ada
  (dev/node → jadi no-op).
- Short-circuit `/_nuxt/*` yang tidak dikenal → `404` polos (Fase 1.4).
- `resolveCacheControl(pathname)` dari `layers/base/shared/cf-cache-rules.ts`; kalau `undefined` → lanjut normal.
- Bangun cache key: URL absolut + query, **plus varian color-mode** dari cookie
  `events-color-mode` (mis. `&__cm=dark`). Simpan di `event.context.__edgeCacheKey`.
- `caches.default.match(key)` → kalau HIT, set header diagnostik `x-edge-cache: HIT` dan
  **`return response`** (h3 mengirimnya apa adanya).

**2.2 Perluas `layers/base/server/plugins/cacheControl.ts` (store)**
- Plugin ini sudah menyetel `cache-control` pada GET 200 yang cacheable. Tambahkan: di hook
  `beforeResponse`, kalau `event.context.__edgeCacheKey` ada dan response layak simpan →
  bangun `Response` dari body + header, **hapus `set-cookie`**, lalu
  `event.waitUntil(caches.default.put(key, res))`.
- Simpan juga response yang **sudah membawa** `cache-control: public, s-maxage=…` dari
  sumber lain (mis. `/_og/**` dari `nuxt-og-image`) — lihat Risiko #4.
- Jangan simpan saat statusnya bukan 200, atau saat request datang dari cache HIT.

**2.3 Naikkan TTL di `layers/base/shared/cf-cache-rules.ts`**
- `HTML_TTL`: `s-maxage=300` → **3600** (1 jam, sesuai keputusan). `HTML_TTL_LONG` → 21600.
- `API_TTL`: 120 → **600**; `API_TTL_SHORT`: 60 → **120**.
- Tambahkan entri untuk halaman yang tadinya di-prerender: `/privacy`, `/terms`,
  `/event-policy`, `/help-center`, `/ticket-terms-and-conditions`,
  `/ticket-refund-and-return-policy`, `/media-partner-registration`,
  `/sponsorship-registration`, `/contact`, `/book-space`, `/winner`
  (TTL panjang, mis. 21600 — isinya jarang berubah).
- **Purge tetap jalur utama**; TTL hanyalah jaring pengaman.

**2.4 Pangkas `layers/base/modules/cf-cache.ts`**
- Buang blok prerender (`STATIC_PAGES`, `nitro.prerender`) — halaman itu kini SSR + cache (Fase 2.3).
- Buang blok `nitro.cloudflare.pages.routes.exclude` — **kode mati** sejak preset pindah ke
  `cloudflare_module`; `_routes.json` hanya dipakai preset Pages.
- Kalau setelah itu modulnya kosong, hapus modulnya dan `resolve(__dirname, "modules/cf-cache")`
  dari `layers/base/nuxt.config.ts`.
- ⚠️ Verifikasi OG image tetap sehat setelah prerender hilang (Risiko #4).

**2.5 Header diagnostik** — kirim `x-edge-cache: HIT|MISS|SKIP` di semua response supaya
verifikasi dan monitoring bisa dilakukan hanya dengan `curl -I`.

---

## Fase 3 — Data yang harus selalu fresh dipindah ke client

Dengan purge-by-URL (Fase 4), SSR + cache sudah fresh untuk hampir semua data. Fase ini hanya
untuk data yang berubah **lebih cepat daripada jadwal purge** atau bersifat per-pengunjung:

- Harga/stok/phase tiket (`useTicketsListing.js`) dan ketersediaan hotel → `server: false`,
  mengikuti pola yang sudah ada di `useBrandPreview.ts` / `useBrandsListing.js`.
- Section home yang sudah client-only (`useBrandPreview`, `useRundownVisibility`) dibiarkan.
- **Jangan** pindahkan isi artikel `/news/*`, `/guests/*`, `/brands/*` ke client — SEO-nya
  bergantung pada HTML awal (keputusan Q1).

---

## Fase 4 — Invalidasi dari dashboard PM One (`~/Herd/pmone`)

Tujuan: perubahan apa pun di dashboard → URL terkait di 27 zone di-purge dalam hitungan detik.

**4.1 Registry situs — `config/edge-sites.php` (baru)**
Peta `projectUsername → { zone_id, domains[], locales[] }`, plus fan-out `dataSourceUsername`
(`cbe` → cafeexpo, cokelatexpo, icf). Sumber kebenaran ada di `apps/*/app/app.config.ts` +
`apps/*/nuxt.config.ts` di repo pmone-events dan daftar zone dari
`GET /zones?account.id=…` (27 zone).

**4.2 Peta tag → path — `config/edge-cache-map.php` (baru)**
| tag | path API | path HTML |
|---|---|---|
| `brands`, `promotion-posts` | `/api/exhibitors`, `/api/exhibitors/with-conjunctions`, `/api/editions` | `/brands`, `/brands/{slug}` |
| `guests` | `/api/event/guests` | `/guests`, `/guests/{slug}` |
| `tickets` | `/api/tickets/{eventSlug}` | `/tickets` |
| `faqs` | `/api/event/faq` | `/faq` |
| `partners` | `/api/event/partners` | `/partners` |
| `programs` | `/api/event/programs` | `/programs` |
| `media-coverages` | `/api/event/media-coverage` | `/partners`, `/` |
| `blog-posts` | `/api/blog/posts`, `/api/blog/posts/{slug}` | `/news`, `/news/{slug}` |
| `hotels`, `exchange-rates` | `/api/hotels` | `/hotels` |
| `forms-public` | `/api/forms/{slug}` | `/forms/{slug}` |
| `events` | `/api/event/active`, `/api/editions`, `/api/event/rundown` | `/`, `/rundown` |
| `projects` (global) | `/api/event/website-settings`, `/api/project/profile` | → `purge_everything` zone |

Setiap path HTML di-expand ke semua locale prefix (`""`, `/id`, `/zh`, `/ja`, `/ko`) —
pakai `LOCALE_CODES` di `layers/base/shared/cf-cache-rules.ts` sebagai acuan.

**4.3 `app/Support/EdgeCache.php` (baru)** — kembangkan pola `CloudflareCache.php`:
- `purgeUrls(array $urls)` — batch **30 URL per request** (limit non-Enterprise), per zone.
- `purgeZone(string $zoneId)` — `purge_everything` untuk tag global.
- Tidak pernah melempar exception; kegagalan hanya di-`Log::warning` (ikuti pola yang ada,
  karena TTL 1 jam sudah jadi jaring pengaman).

**4.4 `app/Jobs/PurgeEdgeCache.php` (baru)** — `ShouldQueue` + `ShouldBeUnique` per
kombinasi tag+project, delay debounce ±5 detik (pola persis `PurgeCloudflareCache.php`).

**4.5 Dua jalur pemicu**
- **Presisi (URL spesifik):** ubah `app/Traits/ClearsResponseCache.php` agar callback model
  meneruskan instance-nya (`static::saved(fn ($model) => …)`). Model boleh mengimplementasikan
  `edgeCacheUrls(): array` (mis. `Post` → `["/news/{$this->slug}"]`) dan
  `edgeCacheProjects(): array`. Ini meng-cover **31 model** — mayoritas perubahan konten.
- **Jaring pengaman (tag saja):** `app/Support/TagAwareResponseCache.php` yang meng-`extend`
  `Spatie\ResponseCache\ResponseCache` dan meng-override `clear(array $tags)` → `parent::clear()`
  lalu dispatch `PurgeEdgeCache`. Pasang di `AppServiceProvider::boot()` dengan
  `$this->app->extend('responsecache', fn ($rc, $app) => $app->make(TagAwareResponseCache::class))`.
  Ini menangkap **±109 call-site tanpa mengedit satu pun**, termasuk controller dan importer.
- Aturan gagal-aman: project tidak terdeteksi → purge di semua zone; URL tidak terdeteksi →
  purge path list untuk tag itu.
- `PurgeCloudflareCacheOnResponseCacheCleared` yang lama **tetap dipertahankan** untuk zone
  `api.pmone.id` — perannya berbeda dan tidak bentrok.

**4.6 Command manual** — `php artisan edge:purge {--project=} {--all}` untuk pemulihan darurat.

---

## Verifikasi

**Per fase, sebelum lanjut:**

1. **Fase 1:** `curl -sI https://indonesiacomiccon.com/wp-admin/index.php` → `403` dari WAF
   (bukan `404` dari worker). Muat halaman mana pun di browser → **nol** request ke
   `/api/_nuxt_icon/*` di tab Network, dan tidak ada ikon yang hilang.
2. **Fase 2 (kunci):**
   ```bash
   curl -sI https://indonesiacomiccon.com/id/news/urutan-film-marvel | grep -i x-edge-cache
   # request 1 → MISS ; request 2 → HIT
   ```
   Cek varian color-mode: request dengan `-H 'Cookie: events-color-mode=light'` dan `=dark`
   harus menghasilkan HTML berbeda (`<html class="light">` vs `class="dark">`) dan keduanya HIT
   setelah pemanasan. Pastikan response cached **tidak** membawa `set-cookie`.
   Cek `/tickets/checkout`, `/api/track/visit` → harus `SKIP`, tidak pernah ter-cache.
   Cek OG image `/_og/...` masih 200 dan ter-cache.
3. **Fase 4:** ubah satu Rundown di dashboard PM One → dalam <30 detik
   `https://<domain>/rundown` menampilkan data baru dan `x-edge-cache: MISS` sekali lalu `HIT`.
   Ulangi untuk Post (`/news/{slug}`), Brand, Ticket, dan Website Settings (→ purge_everything).
4. **Regresi visual:** buka home, `/news`, artikel, `/tickets`, `/brands`, `/rundown` di
   minimal 3 situs (icc, megabuild, flei) dalam mode terang **dan** gelap.

**Verifikasi hasil (angka, bukan perasaan) — H+1, H+3, H+7 setelah deploy:**
Jalankan lewat GraphQL Cloudflare (sesi dashboard atau token analytics):
```graphql
workersOverviewRequestsAdaptiveGroups(
  limit: 100, filter: {date_geq: "…", date_leq: "…"}, orderBy: [date_ASC]
) { dimensions { date } count sum { cpuTimeUs } }
```
- Gate H+1: CPU harian **< 3M ms** (dari 12–18M).
- Gate H+3: CPU harian **< 1,2M ms** dan `x-edge-cache` HIT-rate >85% pada halaman teratas.
- Gate H+7: CPU kumulatif siklus on-track untuk **< 30M ms**. Kalau tidak, eskalasi ke
  fase optimasi payload (yang sengaja ditunda).
- Catat setiap pemeriksaan di `docs/cf-cpu-daily-log.md`.

**Rollback:** Fase 2 bisa dimatikan tanpa deploy ulang dengan menghapus WAF rule dan
mengembalikan TTL; middleware edge-cache dibuat agar otomatis no-op saat `caches.default`
tidak ada, jadi `git revert` satu commit sudah cukup untuk kembali ke perilaku lama.

## Definition of done

- [ ] Invoice 22 Agustus 2026 = **$5,00** (tidak ada baris Workers CPU billable).
- [ ] Perubahan Rundown/Brand/Ticket/Post/Website Settings di dashboard tercermin di situs
      publik dalam <30 detik, tanpa rebuild.
- [ ] `docs/cf-cpu-daily-log.md` terisi harian sampai 22 Agustus 2026.
- [ ] Memory `cf-workers-cpu-overrun-2026-07` dihapus/di-update jadi "selesai" setelah invoice
      Agustus terkonfirmasi $5,00.
