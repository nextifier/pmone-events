# PM One Events

Nuxt 4 monorepo berisi **website event** yang masing-masing consume API dari backend **PM One** (`api.pmone.id`). Kode shared (~85%) ada di base layer, setiap event app hanya berisi konfigurasi, aset, dan komponen/halaman unik.

## Events

| App | Domain | Mode | Fitur Unik |
|---|---|---|---|
| **Megabuild** | [megabuild.co.id](https://megabuild.co.id) | Dark | MegaProperty page, FactsAndFigures |
| **Keramika** | [keramika.co.id](https://keramika.co.id) | Light | FactsAndFigures |
| **Renex** | [renex.megabuild.co.id](https://renex.megabuild.co.id) | Dark | FactsAndFigures |
| **FLEI** | [franchise-expo.co.id](https://franchise-expo.co.id) | Dark | BuildingAnimation, LogoAnimated, BusinessSegments |
| **Cafe Expo** | [cafebrasserieexpo.com](https://cafebrasserieexpo.com) | Light | AnimatedShapes, AccentRandomLetters, sibling event logos |
| **ICF** | [indocoffeefestival.com](https://indocoffeefestival.com) | Dark | AnimatedShapes, sibling event logos |
| **Cokelat Expo** | [cokelatexpo.id](https://cokelatexpo.id) | Dark | AnimatedShapes, sibling event logos |
| **More Food** | [morefoodexpo.com](https://morefoodexpo.com) | Light | HeroImages, KVPatterns |
| **Outing Expo** | [indooutingexpo.co.id](https://indooutingexpo.co.id) | Light | PastExhibitors |
| **ICC** | [indonesiacomiccon.com](https://indonesiacomiccon.com) | Dark | Guests, cosplay events, GSAP animations |
| **INACON** | [indonesiaanimecon.com](https://indonesiaanimecon.com) | Dark | Guests, cosplay events, ICGP page, GSAP animations |

### Sibling Event Groups

- **Cafe Expo + ICF + Cokelat Expo** - Shared design language (AnimatedShapes, AccentRandomLetters, KVPatterns), custom font Sink.woff2
- **ICC + INACON** - Shared guest system, cosplay event pages, AccentColorSwitcher, GSAP plugin

## Architecture

```
pmone-events/
├── pnpm-workspace.yaml
├── package.json                  # Dev/build scripts untuk semua event
├── layers/
│   └── base/                     # @events/base - semua shared code
│       ├── nuxt.config.ts
│       ├── package.json
│       └── app/
│           ├── app.config.ts     # Default config schema
│           ├── app.vue           # Root component
│           ├── error.vue         # Error page
│           ├── assets/css/       # main.css (Tailwind v4)
│           ├── components/       # ~70+ shared components + 55 shadcn-vue UI
│           ├── composables/      # 15 shared composables/stores
│           ├── layouts/          # default.vue
│           ├── lib/              # utils.ts (cn helper)
│           ├── pages/            # 21 shared pages
│           └── plugins/          # 9 shared plugins
└── apps/
    ├── megabuild/
    ├── keramika/
    ├── renex/
    ├── flei/
    ├── cafeexpo/
    ├── icf/
    ├── cokelatexpo/
    ├── morefood/
    ├── outingexpo/
    ├── icc/
    └── inacon/
```

### App Structure (Minimal Override)

```
apps/<event>/
├── nuxt.config.ts              # extends: ["../../layers/base"]
├── package.json                # depends on @events/base workspace:*
├── .env                        # NUXT_PM_ONE_API_KEY
└── app/
    ├── app.config.ts           # Event-specific config (WAJIB)
    ├── assets/css/app.css      # Event-specific styles
    ├── composables/content.js  # Event-specific content store (override)
    ├── components/
    │   ├── Hero.vue            # Event-specific hero (WAJIB override)
    │   ├── Logo.vue            # Event-specific logo (WAJIB override)
    │   └── ...                 # Event-specific components
    ├── pages/
    │   └── index.vue           # Custom home page (WAJIB override)
    └── public/                 # Logo, favicon, OG images
```

> File di `app/` otomatis override file dengan nama sama dari base layer (components, composables, pages, public assets).

## Tech Stack

| Category | Packages |
|---|---|
| **Framework** | Nuxt 4, Vue 3, Pinia |
| **Styling** | Tailwind CSS v4, shadcn-vue (reka-ui), tw-animate-css |
| **Animation** | GSAP 3, @formkit/auto-animate, canvas-confetti |
| **Carousel** | embla-carousel-vue + autoplay, auto-scroll, wheel-gestures |
| **UI Components** | vue-sonner (toast), vue-tippy (tooltips), reka-ui Drawer, v-wave (ripple) |
| **Images** | @nuxt/image (Cloudflare provider prod, ipx dev) |
| **SEO** | @nuxtjs/seo, nuxt-gtag |
| **Icons** | @nuxt/icon (hugeicons, lucide, ri) |
| **Utilities** | @vueuse/core, @vueuse/math, dayjs, @number-flow/vue |
| **Phone Input** | base-vue-phone-input |
| **Gallery** | vue3-picture-swipe |
| **Deployment** | Cloudflare Pages (nitro preset: cloudflare-pages) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9

### Installation

```bash
git clone <repository-url>
cd pmone-events
pnpm install
```

### Environment Variables

Setiap app membutuhkan file `.env` di `apps/<event>/`:

```env
NUXT_PM_ONE_API_KEY=pk_xxxxx
```

Runtime config tersedia di base layer:

| Variable | Scope | Default | Description |
|---|---|---|---|
| `NUXT_PM_ONE_API_KEY` | Server | - | API key per event (wajib) |
| `NUXT_PUBLIC_SITE_URL` | Public | `http://localhost:3000` | Event domain URL |
| `NUXT_PUBLIC_API_URL` | Public | `https://api.pmone.id` (prod) / `http://localhost:8000` (dev) | Backend API URL |
| `NUXT_PUBLIC_BLOG_USERNAMES` | Public | - | PM One project username(s) untuk blog/news |

### Development

```bash
# Jalankan dev server untuk event tertentu
pnpm dev:megabuild    # megabuild.co.id (port 3000)
pnpm dev:keramika     # keramika.co.id
pnpm dev:renex        # renex.megabuild.co.id
pnpm dev:flei         # franchise-expo.co.id
pnpm dev:cafeexpo     # cafebrasserieexpo.com
pnpm dev:icf          # indocoffeefestival.com
pnpm dev:cokelatexpo  # cokelatexpo.id
pnpm dev:morefood     # morefoodexpo.com
pnpm dev:outingexpo   # indooutingexpo.co.id
pnpm dev:icc          # indonesiacomiccon.com
pnpm dev:inacon       # indonesiaanimecon.com
```

### Build

```bash
# Build event tertentu
pnpm build:megabuild

# Build semua event
pnpm build:all
```

## Shared Pages

21 halaman tersedia dari base layer untuk semua event:

| Route | Description |
|---|---|
| `/` | Home page (WAJIB override per event) |
| `/ticket` | Ticket / registration |
| `/book-space` | Exhibitor booth booking form |
| `/contact` | Contact form |
| `/faq` | FAQ |
| `/gallery` | Photo gallery |
| `/links` | Linktree-style page |
| `/partners` | Sponsors / partners |
| `/privacy` | Privacy policy |
| `/rundown` | Event schedule |
| `/terms` | Terms and conditions |
| `/event-policy` | Event policy |
| `/help-center` | Help center |
| `/winner` | Winner page |
| `/programs` | Main programs |
| `/brands` | Brand / exhibitor listing |
| `/brands/[slug]` | Brand detail |
| `/news` | Blog listing |
| `/news/[slug]` | Blog detail |
| `/ticket-terms-and-conditions` | Ticket T&C |
| `/ticket-refund-and-return-policy` | Ticket refund policy |

### Extra Pages per Event

- **Megabuild**: `/megaproperty`
- **ICC**: `/guests`, `/guests/[slug]`, special program pages, `/anti-harassment-policy`, `/event-guidelines`, `/safety-and-weapon-policy`
- **INACON**: `/guests`, `/guests/[slug]`, special program pages, `/icgp`, `/anti-harassment-policy`, `/event-guidelines`, `/safety-and-weapon-policy`

## App Config Contract

Setiap app WAJIB define `app/app.config.ts` yang override schema dari base layer:

```ts
export default defineAppConfig({
  app: {
    name: "Event Name",
    shortName: "EVENT",
    projectUsername: "event.username",
    url: "https://event-domain.com",
    company: { name: "Company Name", address: "Address" },
  },

  event: {
    title: "Event Title",
    edition: { value: 1, ordinal: "1st" },
    poster: "/img/poster.webp",
    status: "upcoming", // "upcoming" | "live" | "completed" | ""
    startTime: "2026-01-01T00:00:00+07:00",
    endTime: "2026-01-03T23:59:59+07:00",
    date: "1 - 3 January 2026",
    dateOnly: "1 - 3",
    month: "January",
    year: "2026",
    time: "10:00 - 21:00 WIB",
    location: "Jakarta Convention Center",
    locationShort: "JCC",
    locationLink: "https://maps.google.com/...",
    hall: "Hall A",
    teaserVideoId: "",
    profileImage: "/img/profile.webp",
    inConjunction: {
      label: "In conjunction with",
      list: [{ name: "Sibling Event", url: "https://...", img: "/img/logo.webp" }],
    },
  },

  settings: {
    header: { logoClass: "h-6 text-primary" },
    footer: { logoClass: "h-8 text-primary" },
    ticket: {
      tabs: {
        showTickets: true,
        showGuests: false,
        showBrands: true,
        showRundown: true,
        showAbout: true,
        showPhotos: true,
      },
    },
    blog: { showPostCardAuthor: false, showPostCardExcerpt: false },
    ogImage: { isDarkMode: true },
    bookSpaceForm: { showJobTitle: false, showBrandName: true, showProducts: false },
    terms: { lastUpdate: "January 1, 2026" },
  },

  contact: { email: "", whatsapp: "", whatsappMarketing: "" },

  social: { instagram: "", facebook: "", linkedin: "", youtube: "", tiktok: "", x: "" },

  contactLinks: {},
  socialLinks: {},

  routes: {
    header: [],  // Navigation items
    dialog: [],  // Mobile menu items
    footer: [],  // Footer navigation
  },
})
```

## Shared Composables & Stores

| File | Type | Description |
|---|---|---|
| `content.js` | Pinia Store | Text content per event (hero, sections, CTA) - WAJIB override |
| `faq.js` | Pinia Store | FAQ data |
| `gallery.js` | Pinia Store | Gallery photos |
| `news-coverages.js` | Pinia Store | News/media coverages |
| `partners.js` | Pinia Store | Partners/sponsors |
| `posts.js` | Pinia Store | Blog posts |
| `tickets.js` | Pinia Store | Ticket data |
| `ui.js` | Pinia Store | UI state management |
| `useCurrencyFormat.js` | Composable | Currency formatting (IDR) |
| `useCurrentTime.js` | Composable | Reactive current time |
| `useHidePageScrollbar.js` | Composable | Toggle page scrollbar visibility |
| `usePageMeta.js` | Composable | SEO page meta helper |
| `useProcessedContent.js` | Composable | Process dynamic content |
| `useShortcuts.ts` | Composable | Keyboard shortcuts |
| `defineShortcuts.ts` | Utility | Shortcut definition helper |

## Plugins

| Plugin | Description |
|---|---|
| `dayjs.ts` | Date formatting (dayjs) |
| `embla-plugins.js` | Carousel plugin registration |
| `number-flow.ts` | Number animation component |
| `scrollToTopIfCurrentPageIs.js` | Scroll-to-top on same page navigation |
| `updateMetaThemeColor.js` | Dynamic meta theme-color |
| `vScrollTo.js` | Scroll-to directive (vue-scrollto) |
| `vue-tippy.ts` | Tooltip directive (vue-tippy) |
| `vue3PictureSwipe.client.js` | Image gallery lightbox (client-only) |
| `vWave.directive.ts` | Ripple effect directive (v-wave) |

## Server API

Base layer menyediakan server routes yang proxy ke PM One API:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/blog/posts` | Fetch blog posts |
| GET | `/api/blog/posts/[slug]` | Fetch single blog post by slug |
| POST | `/api/contact/submit` | Submit contact form |
| GET | `/api/sitemap-urls` | Generate dynamic sitemap URLs |

## UI Components

### shadcn-vue (55+ components)

Base layer menggunakan [shadcn-vue](https://www.shadcn-vue.com/) di `layers/base/app/components/ui/` tanpa prefix. Dikonfigurasi via `components.json`.

### Icon Libraries

Tiga icon set tersedia via `@nuxt/icon` (mode: SVG, client bundle scan):

- **hugeicons** - Primary icon set
- **lucide** - Secondary icons
- **ri** (Remix Icon) - Supplementary icons

### Custom Components

70+ shared components di base layer termasuk: Header, Footer, Hero, Countdown, FAQ, Gallery, Rundown, Tickets, BrandList, ContactForm, Marquee, dan lainnya.

## Styling

### Tailwind CSS v4

- Plugin: `@tailwindcss/vite`, `@tailwindcss/forms`, `@tailwindcss/typography`
- Custom breakpoints: `xs` (475px), default sm/md/lg/xl/2xl, `3xl` (1800px)
- Default font: MinusOne (variable font)
- Dark mode support dengan CSS custom properties
- Custom color palettes: KV (Brown, Green, Purple), Yellow (ICC/INACON)

### Layer Scanning

Tailwind v4 membutuhkan explicit `@source` directives di `main.css` untuk scan files dari Nuxt layers:

```css
@source "../../components/**/*.vue";
@source "../../composables/**/*.js";
@source "../../layouts/**/*.vue";
@source "../../pages/**/*.vue";
@source "../../plugins/**/*.js";
```

## Deployment

Setiap event di-deploy ke **Cloudflare Pages** secara terpisah.

- **Preset**: `cloudflare-pages` (dikonfigurasi di setiap app `nuxt.config.ts`)
- **Build command**: `pnpm build:<event>`
- **Output directory**: `apps/<event>/.output/public`
- **Image provider**: Cloudflare (production), ipx (development)

### Standard Route Rules

Semua event memiliki redirect rules:

```
/tickets  ->  /ticket     (301)
/blog/**  ->  /news/**    (301)
```

### Robots

Disallow: `/terms`, `/privacy`, `/winner`

## Menambah Event Baru

1. Copy template dari event yang mirip di `apps/`
2. Edit `nuxt.config.ts` - domain, gtag ID, color mode
3. Edit `app/app.config.ts` - semua data event
4. Edit `app/composables/content.js` - semua teks konten
5. Buat `app/components/Hero.vue` dan `Logo.vue` (WAJIB)
6. Buat `app/pages/index.vue` (home page) (WAJIB)
7. Tambah assets ke `public/` (logo, favicon, OG image)
8. Setup `.env` dengan `NUXT_PM_ONE_API_KEY`
9. Tambah dev/build scripts di root `package.json`
10. `pnpm install` lalu `pnpm dev:<new-event>`

## Important Gotchas

### Hero.vue & Logo.vue WAJIB Override

Base layer Hero.vue dan Logo.vue berisi konten Megabuild yang di-hardcode. Setiap event **HARUS** punya override sendiri.

### Content Store Override

Setiap event punya `app/composables/content.js` (Pinia store) yang override base. Berisi teks hero, section headings, CTA. Pastikan konten sesuai event.

### GSAP Plugin (ICC/INACON only)

ICC dan INACON menggunakan GSAP animations dan membutuhkan `app/plugins/gsap.client.js`:

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    gsap.registerPlugin(ScrollTrigger);
  }
  return { provide: { gsap, ScrollTrigger } };
});
```

### Path Resolution di Layer Config

Relative paths di layer `nuxt.config.ts` resolve dari APP, bukan layer. Gunakan absolute paths:

```ts
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));

css: [resolve(__dirname, "app/assets/css/main.css")],
```

### app.config.ts Location (Nuxt 4)

`app.config.ts` harus di dalam `app/` directory:
- Benar: `apps/<event>/app/app.config.ts`
- Salah: `apps/<event>/app.config.ts`

### Auto-imports di Layers

- Composable files di `composables/` auto-imported
- Subdirectory `composables/stores/` **TIDAK** auto-imported
- Store files butuh explicit `import { defineStore } from 'pinia'`

### App Manifest Disabled

`experimental.appManifest` harus `false` di base layer untuk mencegah error `/_nuxt/builds/meta/dev.json` 404.

### PrimitiveProps

Jangan gunakan `extends PrimitiveProps` di component Props interface. Define `as` dan `asChild` secara explicit untuk menghindari Vue runtime warning.

## License

Private - All rights reserved.
