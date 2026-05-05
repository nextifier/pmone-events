<template>
  <div class="space-y-20 overflow-hidden pb-20 lg:space-y-28 lg:pb-28">
    <BrandGuidelinesHero />

    <BrandGuidelinesLogoLab />

    <section id="brand-colors" class="container space-y-6 lg:space-y-8">
      <div class="flex flex-col gap-y-3">
        <span class="section-subtitle">02 · Color</span>
        <h2 class="section-title">Three groups, one palette.</h2>
        <p class="section-description">
          Core tokens drive every UI surface. Signature accents live inside the
          shader and key art. Neutrals are the zinc ramp behind borders,
          backgrounds, and text shades. Click any swatch to copy the value.
        </p>
      </div>

      <button
        type="button"
        class="gradient-accent border-primary/10 group brand-on-image-text relative flex h-32 w-full items-end overflow-hidden rounded-3xl border p-5 text-left text-white sm:h-40"
        @click="copyClass('gradient-accent')"
      >
        <div class="flex w-full items-end justify-between gap-4">
          <div class="flex flex-col gap-y-1">
            <span class="text-sm font-medium tracking-tight">
              Signature gradient
            </span>
            <span class="font-mono text-base font-medium tracking-tighter">
              .gradient-accent
            </span>
          </div>
          <Icon
            :name="gradientCopied ? 'lucide:check' : 'hugeicons:copy-01'"
            class="size-5"
          />
        </div>
      </button>

      <div class="space-y-5">
        <h3 class="text-muted-foreground text-sm font-medium tracking-tighter">
          Core tokens
        </h3>
        <div class="grid grid-cols-2 gap-x-2 gap-y-3 lg:grid-cols-4">
          <BrandGuidelinesColorSwatch
            v-for="token in tokens"
            :key="token.name"
            v-bind="token"
          />
        </div>
        <p class="text-body text-base tracking-tight">
          Foreground in dark mode is not pure white. We use a warm off-white
          token at
          <code
            class="bg-foreground/5 text-foreground rounded px-1.5 py-0.5 font-mono text-sm"
            >oklch(95.8% 0.012 91.52)</code
          >. It cuts the screen-glare you get from #ffffff and matches the
          warmth of MinusOne.
        </p>
      </div>

      <div class="space-y-5">
        <h3 class="text-muted-foreground text-sm font-medium tracking-tighter">
          Signature accents
        </h3>
        <div class="grid grid-cols-2 gap-x-2 gap-y-3 lg:grid-cols-4">
          <BrandGuidelinesColorSwatch
            v-for="accent in signatureAccents"
            :key="accent.name"
            v-bind="accent"
          />
        </div>
      </div>

      <div class="space-y-5">
        <div class="flex items-end justify-between gap-x-4">
          <h3
            class="text-muted-foreground text-sm font-medium tracking-tighter"
          >
            Neutrals · Zinc
          </h3>
          <span class="text-muted-foreground text-sm tracking-tight">
            11 stops · 50 to 950
          </span>
        </div>

        <div
          class="border-primary/10 grid grid-cols-11 overflow-hidden rounded-2xl border"
        >
          <button
            v-for="zinc in neutralRamp"
            :key="zinc.step"
            type="button"
            :style="{ backgroundColor: zinc.hex }"
            :class="[
              'group flex aspect-square flex-col items-start justify-end gap-1 text-left sm:aspect-[4/5] sm:p-3',
              zinc.step >= 500 ? 'text-white' : 'text-zinc-900',
            ]"
            :aria-label="`Copy ${zinc.hex}`"
            @click="copyHex(zinc.hex)"
          >
            <span
              class="hidden font-mono text-sm font-medium tracking-tight sm:inline"
            >
              {{ zinc.step }}
            </span>
            <span
              class="hidden font-mono text-sm tracking-tight opacity-80 sm:block"
            >
              {{ zinc.hex }}
            </span>
          </button>
        </div>
      </div>
    </section>

    <BrandGuidelinesTypeSpecimen />

    <section id="brand-motion" class="container">
      <div class="flex flex-col gap-y-3">
        <span class="section-subtitle">04 · Motion</span>
        <h2 class="section-title">The shader is a brand asset.</h2>
        <p class="section-description">
          Use the signature shader once per page. Hero areas, social covers, key
          art. Never as a background for body text, never on every screen.
        </p>
      </div>

      <div
        ref="motionRef"
        class="border-primary/10 mt-10 grid grid-cols-1 overflow-hidden rounded-3xl border lg:mt-14 lg:grid-cols-12"
      >
        <div
          class="bg-primary relative isolate col-span-12 aspect-video overflow-hidden lg:col-span-8 lg:aspect-auto"
        >
          <Shader v-if="motionShaderActive" class="size-full">
            <Swirl
              :blend="59"
              color-a="#00fff7"
              color-b="#0066ff"
              color-space="oklch"
              :detail="4.1"
            />
            <Blob
              :center="{ x: 0.85, y: 0.55 }"
              color-a="#ff35c2"
              color-b="#ffaa00"
              color-space="oklch"
              :deformation="1"
              :highlight-intensity="0.8"
              :highlight-z="0.8"
              :size="0.54"
              :softness="1"
              :visible="true"
            />
            <WaveDistortion
              :angle="127"
              edges="mirror"
              :frequency="30"
              :speed="4.9"
              :strength="0.7"
              :visible="true"
              wave-type="triangle"
            />
            <ChromaticAberration :strength="0.02" :visible="true" />
            <FilmGrain :strength="0.15" :visible="true" />
            <Liquify />
          </Shader>

          <div
            class="brand-on-image-text absolute inset-x-6 bottom-6 flex items-end justify-between gap-3 text-white"
          >
            <span class="text-sm font-medium tracking-tight">
              Live shader sample
            </span>
            <span
              class="rounded-full bg-white/15 px-2.5 py-1 font-mono text-sm tracking-tight backdrop-blur-sm"
            >
              ~60fps
            </span>
          </div>
        </div>

        <div
          class="border-primary/10 bg-background col-span-12 grid grid-cols-1 border-t lg:col-span-4 lg:grid-cols-1 lg:border-t-0 lg:border-l"
        >
          <div
            v-for="(item, idx) in motionRules"
            :key="item.title"
            class="border-primary/10 flex flex-col justify-center gap-y-2 p-4 sm:gap-y-4 sm:p-8"
            :class="{ 'border-t': idx > 0 }"
          >
            <div
              class="bg-accent/10 text-accent flex size-12 items-center justify-center rounded-full"
            >
              <Icon :name="item.icon" class="size-6" />
            </div>
            <h3
              class="text-foreground text-2xl font-semibold tracking-tighter sm:text-[26px] sm:!leading-[1.1]"
            >
              {{ item.title }}
            </h3>
            <p class="text-body text-base !leading-relaxed tracking-tight">
              {{ item.body }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section id="brand-voice" class="container space-y-6 lg:space-y-8">
      <div class="flex flex-col gap-y-3">
        <span class="section-subtitle">05 · Voice</span>
        <h2 class="section-title">Say it straight.</h2>
        <p class="section-description">
          Buyers, builders, and operators read fast and skip marketing. Use
          short sentences, real numbers, and active verbs. If a line sounds like
          a brochure, cut it.
        </p>
      </div>

      <div
        class="border-primary/10 flex flex-col overflow-hidden rounded-3xl border"
      >
        <div class="border-primary/10 hidden grid-cols-2 border-b md:grid">
          <div class="border-primary/10 border-r p-4">
            <span
              class="text-muted-foreground text-sm font-medium tracking-tighter"
            >
              We say
            </span>
          </div>
          <div class="p-4">
            <span
              class="text-muted-foreground text-sm font-medium tracking-tighter"
            >
              We don't
            </span>
          </div>
        </div>

        <div
          v-for="(pair, idx) in voicePairs"
          :key="pair.do"
          class="border-primary/10 grid grid-cols-1 md:grid-cols-2"
          :class="{ 'border-t': idx > 0 }"
        >
          <div
            class="border-primary/10 flex flex-col gap-y-2 border-b p-4 md:border-r md:border-b-0 md:p-6"
          >
            <span
              class="text-success-foreground inline-flex items-center gap-x-1 text-sm font-medium tracking-tight md:hidden"
            >
              <Icon name="hugeicons:checkmark-circle-02" class="size-3.5" />
              We say
            </span>
            <p
              class="text-foreground text-base !leading-snug font-medium tracking-tighter sm:text-lg"
            >
              {{ pair.do }}
            </p>
          </div>

          <div class="bg-foreground/[0.02] flex flex-col gap-y-2 p-4 md:p-6">
            <span
              class="text-destructive-foreground inline-flex items-center gap-x-1 text-sm font-medium tracking-tight md:hidden"
            >
              <Icon name="hugeicons:cancel-circle" class="size-3.5" />
              We don't
            </span>
            <p
              class="text-muted-foreground text-base !leading-snug tracking-tighter line-through decoration-red-400 decoration-1 sm:text-lg"
            >
              {{ pair.dont }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div class="flex flex-col gap-y-2">
          <h3 class="text-foreground text-base font-semibold tracking-tighter">
            Words to keep
          </h3>
          <p class="text-body text-sm tracking-tight">
            Floor, room, applied, ship, buy, build, sign, fund, real, demo.
          </p>
        </div>
        <div class="flex flex-col gap-y-2">
          <h3 class="text-foreground text-base font-semibold tracking-tighter">
            Words to drop
          </h3>
          <p class="text-body text-sm tracking-tight">
            Seamless, cutting-edge, revolutionary, unleash, leverage, harness,
            robust, journey, ecosystem.
          </p>
        </div>
        <div class="flex flex-col gap-y-2">
          <h3 class="text-foreground text-base font-semibold tracking-tighter">
            Punctuation
          </h3>
          <p class="text-body text-sm tracking-tight">
            No em-dashes. Comma or period instead. Numbers stay digits past ten.
            Caps stay sentence-case in body.
          </p>
        </div>
      </div>
    </section>

    <section id="brand-imagery" class="container space-y-6 lg:space-y-8">
      <div class="flex flex-col gap-y-3">
        <span class="section-subtitle">06 · Icons and images</span>
        <h2 class="section-title">What we draw with.</h2>
        <p class="section-description">
          Hugeicons for every icon. Real photos for every visual. Match the
          stroke weight of icons to the surrounding text. Crop photos to show
          context, not just a hero subject.
        </p>
      </div>

      <div ref="iconGridRef" class="space-y-5">
        <div class="flex items-center justify-between">
          <h3
            class="text-muted-foreground text-sm font-medium tracking-tighter"
          >
            Icon set · Hugeicons
          </h3>
          <span class="text-muted-foreground text-sm tracking-tight">
            {{ iconSet.length }} marks · stroke 1.5
          </span>
        </div>

        <GridFill
          :count="iconSet.length"
          :cols="10"
          min-col-width="80px"
          rounded="2xl"
        >
          <div
            v-for="icon in iconSet"
            :key="icon"
            class="group bg-background relative flex aspect-square items-center justify-center"
          >
            <Icon
              v-if="iconsVisible"
              :name="icon"
              class="text-foreground size-5 transition-transform group-hover:scale-110 sm:size-6"
            />
          </div>
        </GridFill>
      </div>

      <div class="space-y-5">
        <div class="flex items-end justify-between gap-x-4">
          <h3
            class="text-muted-foreground text-sm font-medium tracking-tighter"
          >
            Photography library
          </h3>
          <span class="text-muted-foreground text-sm tracking-tight">
            Crop wide. Real subjects. Strong light.
          </span>
        </div>

        <div class="columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3">
          <figure
            v-for="image in photoLibrary"
            :key="image.src"
            class="border-primary/10 relative mb-3 block break-inside-avoid overflow-hidden rounded-2xl border sm:mb-4"
          >
            <NuxtImg
              :src="image.src"
              :alt="image.alt"
              :width="image.width"
              :height="image.height"
              sizes="400px sm:600px lg:500px"
              class="block h-auto w-full"
              format="webp"
              loading="lazy"
            />
            <span
              v-if="image.label"
              class="brand-on-image-text absolute inset-x-3 bottom-3 text-base font-medium tracking-tight text-white"
            >
              {{ image.label }}
            </span>
          </figure>
        </div>
      </div>
    </section>

    <section id="brand-downloads" class="container space-y-6 lg:space-y-8">
      <div class="flex flex-col gap-y-3">
        <span class="section-subtitle">07 · Downloads</span>
        <h2 class="section-title">Get the files.</h2>
        <p class="section-description">
          Logo files served as SVG straight from the live components. Need
          another format or color treatment? Email the team.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div v-for="asset in assets" :key="asset.name" class="frame">
          <div
            class="bg-foreground/[0.03] relative flex aspect-[5/3] items-center justify-center overflow-hidden rounded-t-xl px-6"
          >
            <Logo
              v-if="asset.type === 'full'"
              class="text-primary h-12 sm:h-14"
            />
            <LogoMark
              v-else-if="asset.type === 'mark'"
              class="text-primary h-20 w-20 sm:h-24 sm:w-24"
            />
            <LogoType
              v-else-if="asset.type === 'type'"
              class="text-primary h-12 w-auto sm:h-14"
            />
          </div>

          <div class="frame-panel">
            <div class="flex flex-col gap-y-1">
              <h3
                class="text-foreground text-lg font-semibold tracking-tighter"
              >
                {{ asset.name }}
              </h3>
              <p class="text-body text-sm !leading-snug tracking-tight">
                {{ asset.description }}
              </p>
            </div>

            <div class="mt-4 flex items-center justify-between gap-2">
              <span
                class="text-foreground font-mono text-sm font-medium tracking-tight"
              >
                {{ asset.formats.join(" · ") }}
              </span>

              <button
                type="button"
                class="bg-primary text-background hover:bg-foreground inline-flex items-center gap-x-2 rounded-full px-4 py-2 text-sm font-medium tracking-tight transition-colors"
                @click="asset.action?.()"
              >
                <Icon name="hugeicons:download-01" class="size-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        class="pointer-events-none absolute -z-50 size-0 overflow-hidden opacity-0"
      >
        <LogoMark id="brand-mark-source" />
        <LogoType id="brand-type-source" />
      </div>
    </section>

    <section id="brand-contact" class="container">
      <div
        class="bg-primary text-primary-foreground relative isolate flex flex-col items-center gap-y-6 overflow-hidden rounded-3xl p-8 text-center sm:flex-row sm:items-end sm:justify-between sm:gap-x-10 sm:p-12 sm:text-left"
      >
        <div class="flex flex-col gap-y-3">
          <span class="text-sm font-medium tracking-tight sm:text-base">
            Need something else?
          </span>
          <h2 class="text-3xl font-semibold tracking-tighter sm:text-4xl">
            Email the brand team.
          </h2>
          <p
            class="max-w-md text-base leading-relaxed tracking-tight sm:text-lg"
          >
            Press kits, custom lockups, sponsor co-branding, social templates.
            We answer the same week.
          </p>
        </div>

        <a
          :href="`mailto:${contact.email}`"
          class="bg-background text-foreground hover:bg-background/90 inline-flex items-center gap-x-2 rounded-full px-5 py-3 text-base font-medium tracking-tight transition-colors"
        >
          <Icon name="hugeicons:mail-01" class="size-4" />
          {{ contact.email }}
        </a>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  useClipboard,
  useElementVisibility,
  useIntersectionObserver,
  usePreferredReducedMotion,
} from "@vueuse/core";
import { toast } from "vue-sonner";
import {
  Shader,
  Blob,
  ChromaticAberration,
  FilmGrain,
  Liquify,
  Swirl,
  WaveDistortion,
} from "shaders/vue";

const appConfig = useAppConfig();
const event = appConfig.event;
const contact = appConfig.contact;

usePageMeta(null, {
  title: "Brand Guidelines",
  description:
    "The visual system, voice, and asset library for Global AI Expo. Logo, color, typography, motion, and downloadable assets in one place.",
});

const tokens = [
  {
    name: "Foreground",
    hex: "#18181b",
    oklch: "oklch(0.21 0.006 285.885)",
    cssVar: "--foreground",
    usage: "Headings and primary text on light backgrounds.",
    textOn: "dark",
  },
  {
    name: "Background",
    hex: "#ffffff",
    oklch: "oklch(1 0 0)",
    cssVar: "--background",
    usage: "Page background in light mode. Pairs with foreground.",
    textOn: "light",
  },
  {
    name: "Body",
    hex: "#52525b",
    oklch: "oklch(0.37 0.013 285.805)",
    cssVar: "--body",
    usage: "Long-form copy. One step softer than foreground.",
    textOn: "dark",
  },
  {
    name: "Accent",
    hex: "#3b82f6",
    oklch: "oklch(0.62 0.19 259)",
    cssVar: "--accent",
    usage: "Links, focus states, eyebrows, primary CTAs.",
    textOn: "dark",
  },
];

const neutralRamp = [
  { step: 50, hex: "#fafafa" },
  { step: 100, hex: "#f4f4f5" },
  { step: 200, hex: "#e4e4e7" },
  { step: 300, hex: "#d4d4d8" },
  { step: 400, hex: "#a1a1aa" },
  { step: 500, hex: "#71717a" },
  { step: 600, hex: "#52525b" },
  { step: 700, hex: "#3f3f46" },
  { step: 800, hex: "#27272a" },
  { step: 900, hex: "#18181b" },
  { step: 950, hex: "#09090b" },
];

const signatureAccents = [
  {
    name: "Cyan",
    hex: "#00fff7",
    oklch: "oklch(0.93 0.18 195)",
    usage: "Lead color in the shader. Energy, signal, motion entry.",
    textOn: "light",
  },
  {
    name: "Blue",
    hex: "#0066ff",
    oklch: "oklch(0.55 0.24 263)",
    usage: "Depth in the shader. Anchors the cyan and grounds the gradient.",
    textOn: "dark",
  },
  {
    name: "Magenta",
    hex: "#ff35c2",
    oklch: "oklch(0.71 0.27 339)",
    usage: "Heat in the shader blob. Used sparingly outside the shader.",
    textOn: "dark",
  },
  {
    name: "Amber",
    hex: "#ffaa00",
    oklch: "oklch(0.79 0.16 75)",
    usage: "Highlight in the shader blob. Pairs with magenta.",
    textOn: "light",
  },
];

const iconSet = [
  "hugeicons:cpu-charge",
  "hugeicons:cpu",
  "hugeicons:cpu-settings",
  "hugeicons:chip",
  "hugeicons:ai-chip",
  "hugeicons:ai-brain-01",
  "hugeicons:ai-brain-04",
  "hugeicons:ai-brain-05",
  "hugeicons:robot-01",
  "hugeicons:robot-02",
  "hugeicons:machine-robot",
  "hugeicons:neural-network",
  "hugeicons:ai-cloud",
  "hugeicons:ai-cloud-01",
  "hugeicons:ai-network",
  "hugeicons:ai-content-generator-01",
  "hugeicons:ai-folder-01",
  "hugeicons:ai-mail-02",
  "hugeicons:ai-search",
  "hugeicons:ai-image",
  "hugeicons:ai-laptop",
  "hugeicons:ai-computer",
  "hugeicons:ai-audio",
  "hugeicons:cloud-server",
  "hugeicons:server-stack-01",
  "hugeicons:server-stack-02",
  "hugeicons:database",
  "hugeicons:database-01",
  "hugeicons:database-02",
  "hugeicons:code",
  "hugeicons:code-circle",
  "hugeicons:code-folder",
  "hugeicons:computer-terminal-01",
  "hugeicons:console",
  "hugeicons:laptop",
  "hugeicons:laptop-charging",
  "hugeicons:laptop-cloud",
  "hugeicons:laptop-issue",
  "hugeicons:smart-phone-01",
  "hugeicons:smart-phone-02",
  "hugeicons:tablet-01",
  "hugeicons:tablet-02",
  "hugeicons:computer",
  "hugeicons:keyboard",
  "hugeicons:chart-01",
  "hugeicons:chart-02",
  "hugeicons:chart-03",
  "hugeicons:chart-line-data-01",
  "hugeicons:chart-line-data-02",
  "hugeicons:bar-chart",
  "hugeicons:analytics-01",
  "hugeicons:analytics-02",
  "hugeicons:analytics-up",
  "hugeicons:analytics-down",
  "hugeicons:dashboard-circle",
  "hugeicons:dashboard-speed-01",
  "hugeicons:dashboard-speed-02",
  "hugeicons:money-01",
  "hugeicons:money-02",
  "hugeicons:dollar-01",
  "hugeicons:dollar-circle",
  "hugeicons:credit-card",
  "hugeicons:wallet-01",
  "hugeicons:wallet-02",
  "hugeicons:invoice-01",
  "hugeicons:invoice-02",
  "hugeicons:bitcoin-circle",
  "hugeicons:globe",
  "hugeicons:globe-02",
  "hugeicons:earth",
  "hugeicons:location-01",
  "hugeicons:location-04",
  "hugeicons:maps",
  "hugeicons:maps-circle-01",
  "hugeicons:passport",
  "hugeicons:airplane-take-off-01",
  "hugeicons:calendar-01",
  "hugeicons:calendar-03",
  "hugeicons:clock-01",
  "hugeicons:time-04",
  "hugeicons:user",
  "hugeicons:user-multiple",
  "hugeicons:user-group",
  "hugeicons:user-circle",
  "hugeicons:building-01",
  "hugeicons:factory-01",
  "hugeicons:shopping-cart-01",
  "hugeicons:package",
  "hugeicons:delivery-truck-01",
  "hugeicons:target-02",
  "hugeicons:flag-02",
  "hugeicons:bookmark-02",
  "hugeicons:star",
  "hugeicons:favourite",
  "hugeicons:thumbs-up",
  "hugeicons:checkmark-circle-02",
  "hugeicons:checkmark-square-02",
  "hugeicons:cancel-circle",
  "hugeicons:alert-circle",
  "hugeicons:information-circle",
  "hugeicons:question",
  "hugeicons:settings-01",
  "hugeicons:settings-02",
  "hugeicons:wrench-01",
  "hugeicons:tools",
  "hugeicons:filter",
  "hugeicons:search-01",
  "hugeicons:menu-01",
  "hugeicons:grid-view",
  "hugeicons:layers-01",
  "hugeicons:link-04",
  "hugeicons:share-08",
  "hugeicons:download-04",
  "hugeicons:upload-04",
  "hugeicons:mail-01",
  "hugeicons:notification-02",
  "hugeicons:idea-01",
  "hugeicons:rocket",
  "hugeicons:lock",
  "hugeicons:shield-01",
];

const photoLibrary = [
  {
    src: "/img/cta-image.png",
    alt: "Call to action visual",
    width: 1721,
    height: 1963,
    label: "",
  },
  {
    src: "/img/tickets/global-ai-expo-poster.jpg",
    alt: "Global AI Expo poster",
    width: 1080,
    height: 1350,
    label: "",
  },
  {
    src: "/img/tickets/entry-tickets/regular-ticket.jpg",
    alt: "Regular ticket art",
    width: 1080,
    height: 1080,
    label: "Regular ticket",
  },
  {
    src: "/img/tickets/entry-tickets/vip-ticket.jpg",
    alt: "VIP ticket art",
    width: 1080,
    height: 1080,
    label: "VIP ticket",
  },
  {
    src: "/img/thumbnails/media-partner-thumbnail.jpg",
    alt: "Media partner thumbnail",
    width: 1080,
    height: 1080,
    label: "Media partner",
  },
  {
    src: "/img/thumbnails/sponsorship-thumbnail.jpg",
    alt: "Sponsorship thumbnail",
    width: 1080,
    height: 1080,
    label: "Sponsorship",
  },
];

const motionRules = [
  {
    title: "Why we move",
    icon: "hugeicons:cpu-charge",
    body: "AI is compute. Compute is fluid. The shader makes that visible without leaning on circuits or neural lattices.",
  },
  {
    title: "Where to use it",
    icon: "hugeicons:checkmark-circle-02",
    body: "Hero areas, social covers, conference loops. Once per surface. Pair with the -skew-y-10 showcase block.",
  },
  {
    title: "Where not to",
    icon: "hugeicons:cancel-circle",
    body: "Behind body copy. Behind small text. Looped on long pages. Honor reduced-motion preferences as a hard rule.",
  },
];

const voicePairs = [
  {
    do: "Asia's AI floor opens in 30 days.",
    dont: "Welcome to the most exciting AI conference of the year!",
  },
  {
    do: "Every system on the floor is already running at paying customers.",
    dont: "Discover groundbreaking innovations that will transform your business.",
  },
  {
    do: "200 companies. 8 zones. 3 days. One floor.",
    dont: "An unparalleled gathering of industry-leading AI pioneers.",
  },
  {
    do: "Pick a zone, walk straight to vendors who serve it.",
    dont: "Embark on a journey through the AI ecosystem.",
  },
];

const reducedMotion = usePreferredReducedMotion();

const motionRef = ref(null);
const motionInView = ref(false);
const motionShaderActive = computed(
  () => motionInView.value && reducedMotion.value !== "reduce",
);

useIntersectionObserver(
  motionRef,
  ([entry]) => {
    motionInView.value = entry.isIntersecting;
  },
  { rootMargin: "200px" },
);

const iconGridRef = ref(null);
const iconsVisible = ref(false);

useIntersectionObserver(
  iconGridRef,
  ([entry]) => {
    if (entry.isIntersecting) {
      iconsVisible.value = true;
    }
  },
  { rootMargin: "300px" },
);

const { copy: copyText } = useClipboard();
const gradientCopied = ref(false);
let gradientResetTimer;

const copyClass = async (className) => {
  await copyText(`.${className}`);
  toast.success(`Copied .${className}`);
  gradientCopied.value = true;
  clearTimeout(gradientResetTimer);
  gradientResetTimer = setTimeout(() => {
    gradientCopied.value = false;
  }, 1500);
};

const copyHex = async (hex) => {
  await copyText(hex);
  toast.success(`Copied ${hex}`);
};

onUnmounted(() => {
  clearTimeout(gradientResetTimer);
});

const downloadSvg = (svgString, filename) => {
  const blob = new globalThis.Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`Downloaded ${filename}`);
};

const cloneSvg = (selector) => {
  const node = document.querySelector(selector);
  if (!node || node.tagName.toLowerCase() !== "svg") return null;
  const clone = node.cloneNode(true);
  clone.removeAttribute("id");
  clone.removeAttribute("class");
  clone.removeAttribute("style");
  clone.setAttribute("fill", "#0a0a0a");
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return clone;
};

const serializeWithHeader = (node) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(node)}`;

const downloadLogoMark = () => {
  const clone = cloneSvg("#brand-mark-source");
  if (!clone) return;
  downloadSvg(serializeWithHeader(clone), "global-ai-expo-mark.svg");
};

const downloadLogoType = () => {
  const clone = cloneSvg("#brand-type-source");
  if (!clone) return;
  downloadSvg(serializeWithHeader(clone), "global-ai-expo-wordmark.svg");
};

const downloadLogoFull = () => {
  const mark = cloneSvg("#brand-mark-source");
  const type = cloneSvg("#brand-type-source");
  if (!mark || !type) return;

  const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  wrapper.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  wrapper.setAttribute("viewBox", "0 0 2050 400");
  wrapper.setAttribute("fill", "#0a0a0a");

  const markGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  markGroup.setAttribute("transform", "translate(0,0)");
  mark.setAttribute("width", "400");
  mark.setAttribute("height", "400");
  mark.setAttribute("x", "0");
  mark.setAttribute("y", "0");
  markGroup.appendChild(mark);

  const typeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  typeGroup.setAttribute("transform", "translate(450,80)");
  type.setAttribute("width", "1600");
  type.setAttribute("height", "240");
  type.setAttribute("x", "0");
  type.setAttribute("y", "0");
  typeGroup.appendChild(type);

  wrapper.appendChild(markGroup);
  wrapper.appendChild(typeGroup);

  downloadSvg(serializeWithHeader(wrapper), "global-ai-expo-logo.svg");
};

const assets = [
  {
    name: "Logo (full lockup)",
    description: "Mark + wordmark in one SVG. Use this in 90 percent of cases.",
    formats: ["SVG"],
    type: "full",
    action: downloadLogoFull,
  },
  {
    name: "Logomark",
    description:
      "Mark only. Use for app icons, favicons, badges, social avatars.",
    formats: ["SVG"],
    type: "mark",
    action: downloadLogoMark,
  },
  {
    name: "Wordmark",
    description:
      "Type only. Use in horizontal headers where the mark is set elsewhere.",
    formats: ["SVG"],
    type: "type",
    action: downloadLogoType,
  },
];
</script>

<style scoped>
.brand-on-image-text,
.brand-on-image-text :where(span, p, h2, h3, h4) {
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.45),
    0 0 12px rgba(0, 0, 0, 0.25);
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: var(--color-accent);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: var(--color-accent);
  cursor: pointer;
  border: 2px solid white;
}
</style>
