# Performance optimization — cara revert (flei + base layer)

Tanggal: 2026-05-31
Baseline commit (state SEBELUM semua perubahan performa): **`1d24733`** ("updates")

## File yang diubah (10 file, semua perubahan performa + a11y)

- `apps/flei/app/components/HeroVisual26th.vue` — `<img>` hero-gallery → `<NuxtImg>` (auto-webp via Cloudflare) + LCP eager/fetchpriority/preload frame 0
- `apps/flei/app/components/Orb.vue` — render-gating WebGL (IntersectionObserver + tab-hidden + prefers-reduced-motion), cap DPR ke 2, hapus deep-watch yang reinit GL
- `layers/base/app/components/BrandPreview.vue` — `useAsyncData` (blocking) → `useLazyAsyncData` (non-blocking); hapus aria-label redundan (a11y: label-content-name-mismatch)
- `layers/base/app/components/Partnerships.vue` — tambah `:aria-label="item.title"` di link gambar-saja (a11y: link-name)
- `layers/base/app/components/Credits.vue` — aria-label kondisional hanya saat link, bukan span (a11y: aria-prohibited-attr)
- `layers/base/app/composables/useCurrentTime.js` — `setInterval(1000)` → `setTimeout` aligned ke detik
- `layers/base/app/plugins/vue-tippy.ts` — hapus 3 CSS animasi tippy tak terpakai (sisakan shift-away)
- `layers/base/nuxt.config.ts` — preload font MinusOne, tambah module `nuxt-vitalizer` (disablePrefetchLinks)
- `layers/base/package.json` + `pnpm-lock.yaml` — tambah dependency `nuxt-vitalizer`

Patch lengkap (10 file): `.perf-backup/perf-optimization-2026-05-31.patch` (sudah diverifikasi `git apply --reverse --check` lolos).

> CATATAN: `layers/base/app/router.options.ts` dan `layers/base/app/components/ui/bottom-nav/` BUKAN bagian dari perubahan ini (sudah ada sebelum sesi). Jangan ikut di-revert.

## Skenario revert

### A. Belum di-commit (masih di working tree)
Buang semua perubahan performa, kembali ke baseline:
```bash
cd /Users/nextifier/Frontend/pmone-events
git checkout HEAD -- \
  apps/flei/app/components/HeroVisual26th.vue \
  apps/flei/app/components/Orb.vue \
  layers/base/app/components/BrandPreview.vue \
  layers/base/app/components/Partnerships.vue \
  layers/base/app/components/Credits.vue \
  layers/base/app/composables/useCurrentTime.js \
  layers/base/app/plugins/vue-tippy.ts \
  layers/base/nuxt.config.ts \
  layers/base/package.json \
  pnpm-lock.yaml
pnpm install   # sinkronkan node_modules (lepas nuxt-vitalizer)
```

### B. Sudah di-commit + push, ternyata production break
1. **Rollback instan (paling cepat):** Cloudflare Pages dashboard → project flei → Deployments → pilih deployment SEBELUMNYA → "Rollback to this deployment". Tidak perlu git.
2. **Revert di git:** kalau perubahan ini ada di satu commit `<HASH>`:
   ```bash
   git revert <HASH>      # bikin commit kebalikan
   git push               # CF Pages auto-build ulang versi bersih
   ```
   Kalau tersebar di beberapa commit: `git revert <hash-lama>..<hash-baru>`.

### C. Pakai patch backup (tanpa git history)
Patch berisi PERSIS 8 perubahan ini ada di:
`.perf-backup/perf-optimization-2026-05-31.patch`

- Terapkan ulang: `git apply .perf-backup/perf-optimization-2026-05-31.patch`
- Batalkan/reverse: `git apply --reverse .perf-backup/perf-optimization-2026-05-31.patch`

(Sudah diverifikasi `git apply --reverse --check` lolos bersih.)

## Verifikasi setelah revert
```bash
git diff --stat   # harus kosong untuk 8 file di atas
NODE_OPTIONS="--max-old-space-size=8192" pnpm build:flei   # pastikan build hijau
```
