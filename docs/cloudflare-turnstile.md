# Cloudflare Turnstile — Anti-Spam Contact Form

Proteksi bot untuk semua public form di event websites. Form yang dilindungi: **Contact**, **Media Partner Registration**, **Sponsorship Registration**, **Exhibitor Registration (Book Space)** — semuanya memakai komponen yang sama `layers/base/app/components/ContactForm.vue`, jadi satu integrasi melindungi keempatnya di semua situs.

Dibuat 2026-06-23 setelah bot menyalahgunakan contact form (lihat juga lapisan throttle/IP di backend PM One di bawah).

---

## Cara kerja (alur)

1. `ContactForm.vue` saat `onMounted`: **jika `turnstileSiteKey` terisi**, load script Turnstile + render widget (Managed, `appearance: "interaction-only"` = invisible untuk mayoritas user) yang menghasilkan **token**.
2. Saat submit: token dikirim sebagai `cf_turnstile_response` ke server route `layers/base/server/api/contact/submit.post.ts`.
3. Server route jalan di **edge Cloudflare**. **Jika `turnstileSecret` terisi**, ia verifikasi token via Cloudflare `siteverify` **sebelum** proxy ke PM One. Token kosong → **400**, token invalid → **403**.
4. Route ini juga meneruskan **IP visitor asli** (`cf-connecting-ip` → header `X-Forwarded-For`) + `User-Agent` ke PM One (untuk per-IP throttle & forensik di backend).

**Graceful degradation:** kalau site key ATAU secret kosong, lapisan itu di-skip → form jalan seperti semula. **Aman men-deploy kode sebelum key di-set.**

---

## Pembagian config (PENTING)

| Key | Sifat | Disimpan di | Catatan |
|---|---|---|---|
| **Site key** (`NUXT_PUBLIC_TURNSTILE_SITE_KEY` / `runtimeConfig.public.turnstileSiteKey`) | PUBLIC | **KODE**, per-app: `apps/<app>/nuxt.config.ts` → `runtimeConfig.public.turnstileSiteKey` | Di-bake ke client bundle saat build. Aman di-commit. |
| **Secret key** (`NUXT_TURNSTILE_SECRET` / `runtimeConfig.turnstileSecret`) | PRIVATE | **Dashboard Cloudflare Pages** project: Settings → Variables and secrets (type Text) | Dibaca runtime oleh server route. **JANGAN commit.** |

Default di `layers/base/nuxt.config.ts`:
```ts
runtimeConfig: {
  turnstileSecret: process.env.NUXT_TURNSTILE_SECRET || "",       // private
  public: {
    turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || "", // public, di-override per-app di kode
  },
}
```
Nilai `turnstileSiteKey` di `apps/<app>/nuxt.config.ts` meng-override default base, jadi tiap app pakai site key grup widget-nya. Kita TIDAK set `NUXT_PUBLIC_TURNSTILE_SITE_KEY` di dashboard (cukup di kode).

---

## Widget Turnstile

Akun Cloudflare: **Nextifier@gmail.com** (account id `3797ae01f7dfb6dffb5a1b3f82713c33`). Mode: **Managed**.

Dashboard membatasi **maks 10 hostname / widget**. Karena ada 16 domain event, dipakai **2 widget**:

| Widget | Site key (public) | Domain |
|---|---|---|
| **`pmone-events-forms`** (Widget 1, 10 host) | `0x4AAAAAADpOkX83QOOwxmmc` | keramika.co.id, global-ai-expo.pages.dev, megabuild.co.id, renex.megabuild.co.id, campx.id, cokelatexpo.id, cafebrasserieexpo.com, morefoodexpo.com, indocoffeefestival.com, indooutingexpo.co.id |
| **`pmone-events-forms-2`** (Widget 2, 6 host) | `0x4AAAAAADpOqQtuQn6UfF_P` | iicc.askindo.id, franchise-expo.co.id, indonesiaanimecon.com, indonesiacomiccon.com, panoramaevents.id, panoramamedia.co.id |

> **Secret key TIDAK ditulis di sini.** Ambil dari dashboard: Turnstile → klik widget → "View Turnstile Keys" (atau "Edit Widget") → Secret key (Click to copy).

---

## Pemetaan app → widget → Cloudflare Pages project

Nama project Pages = `<app>-v5` kecuali `global-ai-expo`. (Versi `-v4`/non-`v5` adalah deploy lama/non-aktif.)

| app (`apps/`) | domain | Widget | Pages project | Status |
|---|---|---|---|---|
| global-ai-expo | global-ai-expo.pages.dev | 1 | `global-ai-expo` | ✅ live + tested |
| keramika | keramika.co.id | 1 | `keramika-v5` | ✅ secret set (form di-disable user) |
| megabuild | megabuild.co.id | 1 | `megabuild-v5` | ⏳ secret pending |
| renex | renex.megabuild.co.id | 1 | `renex-v5` | ⏳ secret pending |
| campx | campx.id | 1 | `campx-v5` | ✅ secret set (site key belum di-push) |
| cokelatexpo | cokelatexpo.id | 1 | `cokelatexpo-v5` | ⏳ secret pending |
| cafeexpo | cafebrasserieexpo.com | 1 | `cafeexpo-v5` | ⏳ secret pending |
| morefood | morefoodexpo.com | 1 | `morefood-v5` | ✅ secret set (site key belum di-push) |
| icf | indocoffeefestival.com | 1 | `icf-v5` | ⏳ secret pending |
| outingexpo | indooutingexpo.co.id | 1 | `outingexpo-v5` | ⏳ secret pending |
| iicc | iicc.askindo.id | 2 | `iicc-v5` | ⏳ secret pending |
| flei | franchise-expo.co.id | 2 | `flei-v5` | ⏳ secret pending |
| inacon | indonesiaanimecon.com | 2 | `inacon-v5` | ⏳ secret pending |
| icc | indonesiacomiccon.com | 2 | `icc-v5` | ⏳ secret pending |
| panorama-events | panoramaevents.id | 2 | `panorama-events-v5` | ⏳ secret pending |
| panorama-media | panoramamedia.co.id | 2 | `panorama-media-v5` | ⏳ secret pending |

### Status rollout (2026-06-23) — SELESAI
- ✅ **Semua 16 secret `NUXT_TURNSTILE_SECRET` sudah di-set** di dashboard Pages (terverifikasi via API: Widget 1 ×10 + Widget 2 ×6, tiap value cocok widget-nya).
- ✅ **Semua 16 site key** sudah di `apps/<app>/nuxt.config.ts` dan di-push ke `main` → Cloudflare Pages auto-rebuild semua app → Turnstile aktif di semua situs.
- ✅ **global-ai-expo diuji end-to-end**: token valid → submit sukses; tanpa token → 400; token palsu → 403. (keramika identik konfigurasi.)
- ⚠️ **Jangan push 14 site key sebelum secret-nya di-set.** Kalau site key live tanpa secret, form 14 situs itu akan minta token Turnstile di client TAPI tak diverifikasi server → menambah titik gagal tanpa manfaat keamanan. Set secret dulu, baru commit+push site key bersamaan.

---

## Checklist: setup project / event baru

1. **Hostname Turnstile** — tambah domain situs baru (+ `www`) sebagai hostname ke widget yang masih ada slot (Widget 1 atau 2). Kalau dua-duanya penuh (10 host), **buat widget baru**. Dashboard → Turnstile → pilih widget → Settings → Hostname Management.
2. **Site key di kode** — di `apps/<app>/nuxt.config.ts`, dalam `runtimeConfig.public`, tambah:
   ```ts
   turnstileSiteKey: "<site key widget itu>",
   ```
3. **Secret di Pages env** — Cloudflare → Workers & Pages → `<project>` → Settings → Variables and secrets → **Add** → name `NUXT_TURNSTILE_SECRET`, value = **secret key widget itu**, type **Text** → Save.
4. **Env var Pages lain yang wajib** (sama seperti project sibling):
   - `NUXT_PM_ONE_API_KEY` — API key konsumen PM One.
   - `NUXT_PUBLIC_API_URL` — `https://api.pmone.id`.
   - `NUXT_PUBLIC_SITE_URL` — URL situs (mis. `https://namaevent.com`).
   - `NUXT_TIKTOK_ACCESS_TOKENS` — hanya kalau pakai TikTok pixel tracking.
5. **Deploy** — commit + push ke `main` → Cloudflare Pages auto-build. **Perubahan env var hanya berlaku di build berikutnya** (Pages bind env saat build), jadi set secret SEBELUM push.
6. **Verifikasi** — buka `<site>/contact`, di console:
   - `typeof window.turnstile` → `"object"` (script ke-load) & site key ter-bake di HTML.
   - Submit form test → sukses.
   - `await fetch('/api/contact/submit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({project_username:'<username>',subject:'Contact Form',data:{name:'x',email:'x@example.com',phone:'+628123456789',message:'t'},website:'',_token_time:'',cf_turnstile_response:''})}).then(r=>r.status)` → **400** (no-token ditolak).

---

## Cara set `NUXT_TURNSTILE_SECRET` (UI dashboard)

Workers & Pages → project → **Settings** → **Variables and secrets** → **Add** → name `NUXT_TURNSTILE_SECRET`, value = secret widget, type **Text** → **Save**. Muncul "This change will take effect on the next deployment" → push/redeploy supaya aktif.

> Catatan otomasi: API internal dashboard (`https://dash.cloudflare.com/api/v4/accounts/{acct}/pages/projects/{name}`) bisa **GET** dengan cookie session, tapi **PATCH** (mutasi) ditolak 403 tanpa token CSRF yang tidak mudah diekstrak dari JS. Jadi set secret lewat **UI** (atau `wrangler pages secret put` via CLI dengan API token sendiri). Saat mengubah via API, WAJIB merge dengan `deployment_configs.production.env_vars` yang sudah ada — jangan replace, agar `NUXT_PM_ONE_API_KEY` dll tidak terhapus.

---

## Sisi backend PM One (terkait — sudah/akan deploy)

- **trustProxies** dikunci ke CIDR Cloudflare (+ loopback/private) di `bootstrap/app.php` → `$request->ip()` resolve IP visitor asli dari `X-Forwarded-For` (anti-spoof dari hit langsung ke origin).
- **Throttle per-IP** `contact-submit` (5/menit + 30/jam) di `POST /api/contact-forms/submit` (`AppServiceProvider` + `routes/api.php`).
- **Honeypot** (`website` + `_token_time`) via `App\Rules\HoneypotPassed` (sudah ada sebelumnya).
- **"Contact form not enabled" → 403** (bukan 500) via `App\Exceptions\ContactFormUnavailableException`. (Fix ini ada di working tree repo pmone, belum di-commit/deploy per 2026-06-23.)

---

## Gotchas

- **Env var Pages berlaku di build berikutnya**, bukan retroaktif. Set secret SEBELUM push deploy yang memakainya.
- **Token Turnstile single-use + ~expire.** Komponen reset widget setelah tiap submit/error.
- **Managed + interaction-only = invisible** untuk mayoritas user; hanya traffic mencurigakan yang dapat challenge.
- **Limit 10 hostname / widget** → butuh widget tambahan kalau domain bertambah melewati kapasitas grup.
- Site key muncul di URL halaman widget: `…/turnstile/widget/<SITE_KEY>`. Hati-hati ambigu `O` (huruf) vs `0` (nol) saat baca manual — lebih aman copy dari dashboard atau ambil via `View Turnstile Keys`.
