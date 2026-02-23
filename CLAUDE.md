# PM One Events - Nuxt Layers Monorepo

## Overview

Monorepo berisi 11 website event yang masing-masing consume API dari backend **PM One** (`api.pmone.id`). Kode shared (~85%) ada di base layer, setiap event app hanya berisi konfigurasi, aset, dan komponen/halaman unik.

**Backend**: Laravel 12 + PostgreSQL di `/Users/nextifier/Herd/pmone` (domain: `api.pmone.id`, dev: `localhost:8000`)
**Frontend**: Nuxt 4 monorepo di `/Users/nextifier/Frontend/pmone-events/` (deploy ke Cloudflare Pages per event)

## Architecture

```
pmone-events/
├── pnpm-workspace.yaml          # packages: layers/*, apps/*
├── package.json                  # Root: dev/build scripts for all 11 events
├── layers/
│   └── base/                     # @events/base - semua shared code
│       ├── nuxt.config.ts        # Shared modules, runtime config, plugins
│       ├── package.json          # Semua shared dependencies
│       └── app/
│           ├── app.config.ts     # Default values (contract/schema)
│           ├── app.vue           # Root component
│           ├── assets/css/       # main.css (Tailwind v4)
│           ├── components/       # ~70+ shared components
│           ├── composables/      # 15 shared composables
│           ├── layouts/          # default.vue
│           ├── lib/              # utils.ts (cn helper)
│           ├── pages/            # 21 shared pages
│           └── plugins/          # 9 shared plugins
└── apps/
    ├── megabuild/                # megabuild.co.id
    ├── keramika/                 # keramika.co.id
    ├── renex/                    # renex.megabuild.co.id
    ├── flei/                     # franchise-expo.co.id
    ├── cafeexpo/                 # cafebrasserieexpo.com
    ├── icf/                      # indocoffeefestival.com
    ├── cokelatexpo/              # cokelatexpo.id
    ├── morefood/                 # morefoodexpo.com
    ├── outingexpo/               # indooutingexpo.co.id
    ├── icc/                      # indonesiacomiccon.com
    └── inacon/                   # indonesiaanimecon.com
```

## Dev Commands

```bash
pnpm dev:megabuild    # Dev server (default port 3000)
pnpm dev:icc          # Or any event name
pnpm build:megabuild  # Build for Cloudflare Pages
pnpm build:all        # Build all 11 events
```

## How Each App Works

Setiap app di `apps/*/` memiliki struktur minimal:

```
apps/megabuild/
├── nuxt.config.ts              # extends: ["../../layers/base"]
├── package.json                # depends on @events/base workspace:*
├── .env                        # NUXT_PM_ONE_API_KEY, NUXT_PUBLIC_SITE_URL
└── app/
    ├── app.config.ts           # Event-specific configuration (WAJIB)
    ├── composables/content.js  # Event-specific content store (override base)
    ├── components/
    │   ├── Hero.vue            # Event-specific hero section (WAJIB override)
    │   ├── Logo.vue            # Event-specific logo (WAJIB override)
    │   └── ...                 # Event-specific components
    ├── pages/
    │   └── index.vue           # Custom home page (WAJIB override)
    └── public/                 # Logo, favicon, OG images
```

### Nuxt Auto-import Priority

File di app/ otomatis override file dengan nama sama dari base layer. Ini berlaku untuk components, composables, pages, dan public assets.

## App Config Contract

`app.config.ts` di base layer mendefinisikan schema/defaults. Setiap app WAJIB override dengan data event-nya:

```ts
defineAppConfig({
  app: { name, shortName, projectUsername, url, company: { name, address } },
  event: {
    title, edition: { value, ordinal }, poster, status, // "upcoming"|"live"|"completed"|""
    startTime, endTime, date, dateOnly, month, year, time,
    location, locationShort, locationLink, hall, teaserVideoId,
    profileImage, inConjunction: { label, list: [{ name, url, img }] }
  },
  settings: {
    header: { logoClass }, footer: { logoClass },
    ticket: { tabs: { showTickets, showGuests, showBrands, showRundown, showAbout, showPhotos } },
    blog: { showPostCardAuthor, showPostCardExcerpt },
    ogImage: { isDarkMode },
    bookSpaceForm: { showJobTitle, showBrandName, showProducts },
    terms: { lastUpdate }
  },
  contact: { email, whatsapp, whatsappMarketing },
  social: { instagram, facebook, linkedin, youtube, tiktok, x },
  contactLinks: Record<string, { label, path }>,
  socialLinks: Record<string, { label, path, iconName }>,
  routes: { header: [], dialog: [], footer: [] }  // Navigation config
})
```

## 11 Events Overview

| App | Domain | Color Mode | Unique Features |
|---|---|---|---|
| megabuild | megabuild.co.id | dark | megaproperty page, FactsAndFigures |
| keramika | keramika.co.id | **light** | FactsAndFigures |
| renex | renex.megabuild.co.id | dark | FactsAndFigures |
| flei | franchise-expo.co.id | dark | BuildingAnimation, LogoAnimated, BusinessSegments |
| cafeexpo | cafebrasserieexpo.com | **light** | AnimatedShapes, AccentRandomLetters, sibling event logos |
| icf | indocoffeefestival.com | dark | AnimatedShapes, sibling event logos (shares design with cafeexpo/cokelatexpo) |
| cokelatexpo | cokelatexpo.id | dark | AnimatedShapes, sibling event logos (shares design with cafeexpo/icf) |
| morefood | morefoodexpo.com | **light** | HeroImages, KVPatterns |
| outingexpo | indooutingexpo.co.id | **light** | LiveAnimation, PastExhibitors |
| icc | indonesiacomiccon.com | dark | Guests, cosplay events, AccentColorSwitcher, GSAP animations |
| inacon | indonesiaanimecon.com | dark | Guests, cosplay events, ICGP page, GSAP animations |

### Sibling Event Groups

- **cafeexpo + icf + cokelatexpo**: Share design language (AnimatedShapes, AccentRandomLetters, KVPatterns), each has logos of sibling events. Custom font: Sink.woff2
- **icc + inacon**: Share guest system, cosplay event pages (special-show, meet-and-greet, workshop, raya-championship-of-cosplay, portfolio-review), AccentColorSwitcher. Both need GSAP plugin.

## Backend API Integration

Runtime config di base layer:
- `NUXT_PM_ONE_API_KEY` (server-side) - API key per event
- `NUXT_PUBLIC_SITE_URL` - Event domain
- `NUXT_PUBLIC_API_URL` - Default `https://api.pmone.id` (prod), `http://localhost:8000` (dev)
- `NUXT_PUBLIC_BLOG_USERNAMES` - PM One project username(s) for blog/news

API digunakan untuk: blog posts (news), brands/exhibitors, tickets, rundown, gallery, partners, contact form, short links, sitemap URLs.

Server routes di `layers/base/server/` proxy request ke PM One API.

## Key Technology Stack

| Category | Packages |
|---|---|
| Framework | Nuxt 4, Vue 3, Pinia |
| Styling | Tailwind CSS v4, shadcn-vue (reka-ui), tw-animate-css |
| Animation | GSAP 3, @formkit/auto-animate, canvas-confetti |
| Carousel | embla-carousel-vue + autoplay/auto-scroll/wheel-gestures |
| UI | vue-sonner (toast), vue-tippy (tooltips), vaul-vue (drawer), v-wave (ripple) |
| Images | @nuxt/image (Cloudflare provider in prod) |
| SEO | @nuxtjs/seo, nuxt-gtag |
| Icons | @nuxt/icon (hugeicons, lucide, ri) |
| Other | dayjs, @number-flow/vue, base-vue-phone-input, vue3-picture-swipe |
| Deployment | Cloudflare Pages (nitro preset: cloudflare-pages) |

## Shared Pages (Base Layer)

21 halaman tersedia dari base layer untuk semua event:

```
/                  # index.vue (setiap app WAJIB override)
/ticket            # Ticket/registration
/book-space        # Exhibitor booth booking form
/contact           # Contact form
/faq               # FAQ
/gallery           # Photo gallery
/links             # Linktree-style page
/partners          # Sponsors/partners
/privacy           # Privacy policy
/rundown           # Event schedule
/terms             # Terms and conditions
/event-policy      # Event policy
/help-center       # Help center
/winner            # Winner page
/ticket-terms-and-conditions
/ticket-refund-and-return-policy
/programs          # Main programs (route group)
/brands            # Brand/exhibitor listing
/brands/[slug]     # Brand detail
/news              # Blog listing
/news/[slug]       # Blog detail
```

### Extra Pages per Event

- **megabuild**: `/megaproperty`
- **icc**: `/guests`, `/guests/[slug]`, extra program pages, `/anti-harassment-policy`, `/event-guidelines`, `/safety-and-weapon-policy`
- **inacon**: `/guests`, `/guests/[slug]`, extra program pages, `/icgp`, `/anti-harassment-policy`, `/event-guidelines`, `/safety-and-weapon-policy`

## CRITICAL Gotchas

### 1. Hero.vue dan Logo.vue WAJIB Override

Base layer Hero.vue dan Logo.vue berisi konten HARDCODED Megabuild. Setiap event **HARUS** punya Hero.vue dan Logo.vue sendiri di `app/components/` untuk override.

### 2. Content Store Override

Setiap event punya `app/composables/content.js` (Pinia store) yang override base layer. Berisi teks hero, section headings, CTA, dll. Pastikan konten sesuai event, bukan copy-paste Megabuild.

### 3. GSAP Plugin untuk ICC/INACON

ICC dan INACON menggunakan GSAP animations (HeroVisual.vue). Mereka butuh `app/plugins/gsap.client.js`:

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) { gsap.registerPlugin(ScrollTrigger); }
  return { provide: { gsap, ScrollTrigger } };
});
```

Tanpa plugin ini: "Cannot read properties of undefined (reading 'context')" error.

### 4. Path Resolution di Layer nuxt.config

Relative paths di layer `nuxt.config.ts` resolve dari APP, bukan layer. Selalu gunakan absolute paths:

```ts
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
css: [resolve(__dirname, "app/assets/css/main.css")],
shadcn: { componentDir: resolve(__dirname, "app/components/ui") },
```

### 5. app.config.ts Lokasi

Di Nuxt 4, `app.config.ts` harus di dalam `app/` directory:
- Benar: `apps/megabuild/app/app.config.ts`
- Salah: `apps/megabuild/app.config.ts`

### 6. Auto-imports di Layers

- Composable files di `composables/` auto-imported dari layers
- Subdirectory `composables/stores/` TIDAK auto-imported
- Store files harus langsung di `composables/` (bukan subdirectory)
- Store files butuh explicit `import { defineStore } from 'pinia'`

### 7. Tailwind v4 @source di Layers

Tailwind v4 dengan `@tailwindcss/vite` TIDAK otomatis scan files dari Nuxt layers. Harus tambah explicit `@source` directives di main.css:

```css
@source "../../components/**/*.vue";
@source "../../composables/**/*.js";
@source "../../layouts/**/*.vue";
@source "../../pages/**/*.vue";
@source "../../plugins/**/*.js";
```

### 8. tsconfig.json di Layers

Layers TIDAK boleh punya `tsconfig.json` yang extends `.nuxt/tsconfig.json` (`.nuxt` directory hanya ada di app).

### 9. TypeScript Dependency

`typescript` harus ada di base layer `devDependencies` untuk Vue SFC compiler resolve imported types.

### 10. PrimitiveProps - Explicit Props

Jangan gunakan `extends PrimitiveProps` atau `/* @vue-ignore */` di component Props interface. Sebaliknya, define `as` dan `asChild` secara explicit:

```ts
import type { Component } from "vue"

interface Props {
  as?: string | Component
  asChild?: boolean
  // ... props lainnya
}
```

Ini mencegah Vue runtime warning "Property 'as'/'asChild' was accessed during render but is not defined on instance" yang terjadi saat component digunakan di dalam `PopoverTrigger as-child` atau pattern serupa.

### 11. App Manifest Disabled

`experimental.appManifest` harus `false` di base layer. Ini mencegah error `/_nuxt/builds/meta/dev.json` 404 dan `[nuxt] Error preloading payload` di dev mode. Known bug Nuxt yang belum di-fix (https://github.com/nuxt/nuxt/discussions/27624).

```ts
experimental: {
  viewTransition: true,
  appManifest: false,
},
```

## Menambah Event Baru

1. Copy template dari event yang mirip di `apps/`
2. Edit `nuxt.config.ts` - domain, gtag ID, color mode
3. Edit `app/app.config.ts` - semua data event
4. Edit `app/composables/content.js` - semua teks konten
5. Buat `app/components/Hero.vue` dan `Logo.vue`
6. Buat `app/pages/index.vue` (home page)
7. Tambah assets ke `public/` (logo, favicon, OG image)
8. Setup `.env` dengan `NUXT_PM_ONE_API_KEY`
9. Tambah dev/build scripts di root `package.json`
10. `pnpm install` lalu `pnpm dev:new-event`

## Deployment

Setiap event di-deploy ke Cloudflare Pages secara terpisah.
- Build command: `cd apps/<event> && pnpm build`
- Output directory: `apps/<event>/.output/public`
- Preset: `cloudflare-pages` (sudah dikonfigurasi di nuxt.config.ts)

## Original Source Projects

Beberapa event awalnya di repo terpisah (referensi jika butuh file original):

| Event | Original Path |
|---|---|
| megabuild | ~/Frontend/megabuild-v4/ |
| keramika | ~/Frontend/keramika-v4/ |
| flei | ~/Frontend/flei-v4/ |
| cafeexpo | ~/Frontend/cafeexpo-v4/ |
| icf | ~/Frontend/icf-v4/ |
| cokelatexpo | ~/Frontend/cokelatexpo-v4/ |
| icc | ~/Frontend/icc-v4/ |
| inacon | ~/Frontend/inacon-v4/ |
| renex | ~/Frontend/renex/ (tanpa -v4) |
| morefood | ~/Frontend/morefood/ (tanpa -v4) |
| outingexpo | ~/Frontend/outingexpo/ (tanpa -v4) |

## Conventions

- Semua app menggunakan `nitro.preset: "cloudflare-pages"`
- Route rules standar: `/tickets -> /ticket` (301), `/blog/** -> /news/**` (301)
- shadcn-vue components di `layers/base/app/components/ui/` (tanpa prefix)
- Icon sets: hugeicons (primary), lucide, ri
- Image optimization: Cloudflare provider (prod), ipx (dev), quality 85, webp format
- Navigation dikonfigurasi via `routes` di `app.config.ts` (header, dialog, footer arrays)
- Event status: `"upcoming"` | `"live"` | `"completed"` | `""`
