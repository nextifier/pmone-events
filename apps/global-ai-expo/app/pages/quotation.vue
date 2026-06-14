<template>
  <div class="space-y-20 overflow-hidden pb-20 lg:space-y-28 lg:pb-28">
    <section
      id="quotation-hero"
      class="sm:container-wider relative isolate p-1 sm:pt-4"
    >
      <div
        ref="heroRef"
        class="bg-primary quotation-hero-shader relative isolate overflow-hidden rounded-3xl"
      >
        <div
          :class="[
            'absolute inset-0 transition-[clip-path] delay-200 duration-[1400ms] ease-out',
            revealed
              ? '[clip-path:inset(0_0_0_0)]'
              : '[clip-path:inset(0_100%_0_0)]',
          ]"
        >
          <Shader v-if="shaderActive" class="absolute inset-0 size-full">
            <Swirl
              :blend="59"
              color-a="#00fff7"
              color-b="#0066ff"
              color-space="oklch"
              :detail="4.1"
            />
            <Blob
              :center="{ x: 0.7, y: 0.55 }"
              color-a="#ff35c2"
              color-b="#ffaa00"
              color-space="oklch"
              :deformation="1"
              :highlight-intensity="0.8"
              :highlight-z="0.8"
              :size="0.6"
              :softness="1"
              :visible="true"
            />
            <WaveDistortion
              :angle="127"
              edges="mirror"
              :frequency="30"
              :speed="2.4"
              :strength="0.5"
              :visible="true"
              wave-type="triangle"
            />
            <FilmGrain :strength="0.08" :visible="true" />
            <Liquify />
          </Shader>

          <div
            v-else
            aria-hidden="true"
            class="absolute inset-0 bg-linear-to-br from-cyan-500 via-blue-700 to-fuchsia-600"
          ></div>
        </div>

        <div
          class="quotation-hero-content relative z-10 flex min-h-[600px] flex-col items-center justify-center gap-y-6 px-3 py-20 text-center text-white sm:min-h-[680px] sm:gap-y-8 sm:px-6 sm:py-28 lg:min-h-[760px] lg:py-32"
        >
          <div
            class="inline-flex w-fit items-center gap-x-2 rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-base font-medium tracking-tight text-white text-shadow-xs"
          >
            <span class="size-1.5 rounded-full bg-white"></span>
            Quotation · 2026
          </div>

          <h1
            class="text-[14vw] !leading-[0.9] font-semibold tracking-[-0.05em] text-balance text-white sm:text-7xl lg:text-[6.5rem] xl:text-[7.5rem]"
          >
            An event website that just works.
          </h1>

          <p
            class="max-w-xl text-base !leading-relaxed font-medium tracking-tight text-pretty text-white sm:text-lg lg:text-xl"
          >
            Beautiful design. Simple to update. Goes live the same hour you pay.
          </p>

          <div
            class="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            <a
              href="#overview"
              class="inline-flex items-center gap-x-2 rounded-full bg-white px-5 py-3 text-base font-medium tracking-tight text-black transition-colors hover:bg-white/90"
            >
              See the price
              <Icon name="hugeicons:arrow-down-01" class="size-4" />
            </a>
          </div>
        </div>

        <div
          class="quotation-hero-content absolute inset-x-6 bottom-6 z-10 flex items-end justify-between gap-3"
        >
          <span
            class="inline-flex w-fit items-center gap-x-2 rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-base font-medium tracking-tight text-white text-shadow-xs"
          >
            /quotation
          </span>
          <span
            class="inline-flex w-fit items-center gap-x-2 rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-base font-medium tracking-tight text-white text-shadow-xs"
          >
            For {{ event.title }}
          </span>
        </div>
      </div>

      <div
        class="border-primary/10 mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border sm:grid-cols-4"
      >
        <div
          v-for="(item, idx) in summary"
          :key="item.label"
          class="border-primary/10 flex flex-col gap-y-1 p-5"
          :class="{
            'sm:border-l': idx > 0,
            'border-t sm:border-t-0': idx >= 2,
            'border-l': idx === 1 || idx === 3,
          }"
        >
          <span
            class="text-muted-foreground text-sm font-medium tracking-tight"
          >
            {{ item.label }}
          </span>
          <span class="text-foreground text-base font-medium tracking-tighter">
            {{ item.value }}
          </span>
        </div>
      </div>
    </section>

    <section id="overview" class="container space-y-6 lg:space-y-8">
      <div class="flex flex-col gap-y-3">
        <span class="section-subtitle">01 · How it's priced</span>
        <h2 class="section-title">
          Pay once to launch. Pay monthly to keep it running.
        </h2>
        <p class="section-description">
          One payment makes the site yours. The monthly covers hosting and the
          tools you'll use to update it.
        </p>
      </div>

      <div
        class="border-primary/10 grid grid-cols-1 overflow-hidden rounded-3xl border lg:grid-cols-2"
      >
        <div class="flex flex-col gap-y-6 p-8 sm:p-10">
          <div class="flex flex-col gap-y-3">
            <span class="section-subtitle">One-time</span>
            <h3
              class="text-foreground text-3xl font-semibold tracking-tighter sm:text-4xl"
            >
              Website Build &amp; Launch
            </h3>
            <div class="flex items-baseline gap-x-2">
              <span
                class="text-foreground text-3xl font-semibold tracking-tighter sm:text-4xl"
              >
                Rp 17.000.000
              </span>
              <span class="text-muted-foreground text-sm tracking-tight">
                paid once
              </span>
            </div>
          </div>

          <ul class="space-y-3">
            <li
              v-for="bullet in overviewBuild"
              :key="bullet"
              class="section-description flex items-start gap-x-3"
            >
              <Icon
                name="hugeicons:tick-02"
                class="text-foreground mt-1.5 size-4 shrink-0"
              />
              <span>{{ bullet }}</span>
            </li>
          </ul>
        </div>

        <div
          class="border-primary/10 flex flex-col gap-y-6 border-t p-8 sm:p-10 lg:border-t-0 lg:border-l"
        >
          <div class="flex flex-col gap-y-3">
            <span class="section-subtitle">Monthly</span>
            <h3
              class="text-foreground text-3xl font-semibold tracking-tighter sm:text-4xl"
            >
              Hosting &amp; Event Management Platform
            </h3>
            <div class="flex flex-col gap-y-3">
              <div class="flex items-baseline gap-x-2">
                <span
                  class="text-foreground text-3xl font-semibold tracking-tighter sm:text-4xl"
                >
                  Rp 1.700.000
                </span>
                <span class="text-muted-foreground text-sm tracking-tight">
                  per month
                </span>
              </div>
              <div
                class="bg-success/10 text-success-foreground inline-flex w-fit items-center gap-x-2 rounded-full px-3 py-1.5 text-sm font-medium tracking-tight"
              >
                <Icon name="hugeicons:tag-01" class="size-4" />
                Pay yearly: Rp 1.275.000/mo, 3 months free
              </div>
            </div>
          </div>

          <ul class="space-y-3">
            <li
              v-for="bullet in overviewPlatform"
              :key="bullet"
              class="section-description flex items-start gap-x-3"
            >
              <Icon
                name="hugeicons:tick-02"
                class="text-foreground mt-1.5 size-4 shrink-0"
              />
              <span>{{ bullet }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section id="build" class="container space-y-6 lg:space-y-8">
      <div class="flex flex-col gap-y-3">
        <span class="section-subtitle">02 · Inside the build</span>
        <h2 class="section-title">What's in the build.</h2>
        <p class="section-description">
          Built around your event. Looks right on every screen. Ready the moment
          it goes live.
        </p>
      </div>

      <div
        class="border-primary/10 grid grid-cols-1 overflow-hidden rounded-3xl border md:grid-cols-2"
      >
        <div
          v-for="(group, idx) in buildGroups"
          :key="group.title"
          class="border-primary/10 flex flex-col gap-y-4 p-6 sm:p-8"
          :class="[
            idx > 0 ? 'border-t md:border-t-0' : '',
            idx % 2 === 1 ? 'md:border-l' : '',
            idx >= 2 ? 'md:border-t' : '',
          ]"
        >
          <div class="flex items-center gap-x-3">
            <div
              class="bg-accent/10 text-accent flex size-10 items-center justify-center rounded-full"
            >
              <Icon :name="group.icon" class="size-5" />
            </div>
            <h3
              class="text-foreground text-xl font-semibold tracking-tighter sm:text-2xl"
            >
              {{ group.title }}
            </h3>
          </div>

          <p class="section-description">
            {{ group.body }}
          </p>
        </div>
      </div>
    </section>

    <section id="platform" class="container space-y-6 lg:space-y-8">
      <div class="flex flex-col gap-y-3">
        <span class="section-subtitle">03 · Inside the monthly</span>
        <h2 class="section-title">You run the site, not us.</h2>
        <p class="section-description">
          Add a speaker. Swap a photo. Fix a typo. All from one place. No
          waiting on a developer.
        </p>
      </div>

      <div
        class="border-primary/10 grid grid-cols-1 overflow-hidden rounded-3xl border md:grid-cols-2"
      >
        <div
          v-for="(group, idx) in platformGroups"
          :key="group.title"
          class="border-primary/10 flex flex-col gap-y-4 p-6 sm:p-8"
          :class="[
            idx > 0 ? 'border-t md:border-t-0' : '',
            idx % 2 === 1 ? 'md:border-l' : '',
            idx >= 2 ? 'md:border-t' : '',
          ]"
        >
          <div class="flex items-center gap-x-3">
            <div
              class="bg-accent/10 text-accent flex size-10 items-center justify-center rounded-full"
            >
              <Icon :name="group.icon" class="size-5" />
            </div>
            <h3
              class="text-foreground text-xl font-semibold tracking-tighter sm:text-2xl"
            >
              {{ group.title }}
            </h3>
          </div>

          <p class="section-description">
            {{ group.body }}
          </p>
        </div>
      </div>
    </section>

    <section id="revisions" class="container space-y-6 lg:space-y-8">
      <div class="flex flex-col gap-y-3">
        <span class="section-subtitle">04 · Revisions</span>
        <h2 class="section-title">Revisions, kept simple.</h2>
        <p class="section-description">
          Small fixes are always free. Big rework is included three times, then
          capped per round.
        </p>
      </div>

      <div
        class="border-primary/10 grid grid-cols-1 overflow-hidden rounded-3xl border sm:grid-cols-2"
      >
        <div class="flex flex-col gap-y-4 p-6 sm:p-8">
          <div
            class="bg-accent/10 text-accent flex size-12 items-center justify-center rounded-full"
          >
            <Icon name="hugeicons:layers-01" class="size-6" />
          </div>
          <h3 class="text-foreground text-2xl font-semibold tracking-tighter">
            Major changes
          </h3>
          <p class="section-description">
            Three included. Layout shifts, new key visuals, structural rework.
            After three, Rp 2.000.000 each.
          </p>
        </div>

        <div
          class="border-primary/10 flex flex-col gap-y-4 border-t p-6 sm:border-t-0 sm:border-l sm:p-8"
        >
          <div
            class="bg-accent/10 text-accent flex size-12 items-center justify-center rounded-full"
          >
            <Icon name="hugeicons:edit-02" class="size-6" />
          </div>
          <h3 class="text-foreground text-2xl font-semibold tracking-tighter">
            Small fixes
          </h3>
          <p class="section-description">
            Always free. Edit text, swap a photo, tweak a color. Before launch
            and after.
          </p>
        </div>
      </div>
    </section>

    <div class="container grid grid-cols-1 gap-x-2 gap-y-4 lg:grid-cols-2">
      <section id="exclusions" class="space-y-6 lg:space-y-8">
        <div class="flex flex-col gap-y-3">
          <span class="section-subtitle">05 · Not included</span>
          <h2 class="section-title">Not included in the package.</h2>
          <p class="section-description">
            Listed upfront so there are no surprises later.
          </p>
        </div>

        <div
          class="border-primary/10 grid grid-cols-1 overflow-hidden rounded-3xl border"
        >
          <div
            v-for="(item, idx) in exclusions"
            :key="item"
            class="border-primary/10 flex items-start gap-x-3 p-5 sm:p-6"
            :class="[idx > 0 ? 'border-t' : '']"
          >
            <Icon
              name="hugeicons:cancel-01"
              class="text-muted-foreground mt-1 size-4 shrink-0"
            />
            <span
              class="text-foreground text-base !leading-snug tracking-tight"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </section>

      <section id="terms" class="space-y-6 lg:space-y-8">
        <div class="flex flex-col gap-y-3">
          <span class="section-subtitle">06 · The fine print</span>
          <h2 class="section-title">Good to know.</h2>
          <p class="section-description">
            The basics on payment, ownership, and support.
          </p>
        </div>

        <div
          class="border-primary/10 grid grid-cols-1 overflow-hidden rounded-3xl border"
        >
          <div
            v-for="(term, idx) in terms"
            :key="term.title"
            class="border-primary/10 flex flex-col gap-y-3 p-5 sm:p-6"
            :class="[idx > 0 ? 'border-t' : '']"
          >
            <Icon :name="term.icon" class="text-foreground size-5" />
            <h3 class="text-foreground text-lg font-semibold tracking-tighter">
              {{ term.title }}
            </h3>
            <p class="section-description">
              {{ term.body }}
            </p>
          </div>
        </div>
      </section>
    </div>

    <section id="contact" class="container">
      <div
        class="bg-primary text-primary-foreground relative isolate flex flex-col items-center gap-y-6 overflow-hidden rounded-3xl px-4 py-10 text-center sm:flex-row sm:items-end sm:justify-between sm:gap-x-10 sm:px-12 sm:py-16 sm:text-left"
      >
        <div class="flex flex-col gap-y-3">
          <span class="text-sm font-medium tracking-tight sm:text-base">
            Let's start.
          </span>
          <h2 class="text-3xl font-semibold tracking-tighter sm:text-4xl">
            Tell us about your event.
          </h2>
          <p
            class="max-w-md text-base !leading-relaxed tracking-tight sm:text-lg"
          >
            We'll send a kickoff plan the same week. No domain yet? We'll help
            you buy and set it up, free.
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            :href="whatsappHref"
            target="_blank"
            rel="noopener"
            class="bg-background text-foreground hover:bg-background/90 inline-flex items-center justify-center gap-x-2 rounded-full px-5 py-3 text-base font-medium tracking-tight transition-colors"
          >
            <Icon name="hugeicons:whatsapp" class="size-4" />
            WhatsApp
          </a>
          <a
            :href="`mailto:${contact.email}`"
            class="border-background/30 text-primary-foreground hover:bg-background/10 inline-flex items-center justify-center gap-x-2 rounded-full border px-5 py-3 text-base font-medium tracking-tight transition-colors"
          >
            <Icon name="hugeicons:mail-01" class="size-4" />
            {{ contact.email }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useElementVisibility, usePreferredReducedMotion } from "@vueuse/core";
import {
  Shader,
  Blob,
  FilmGrain,
  Liquify,
  Swirl,
  WaveDistortion,
} from "shaders/vue";

const appConfig = useAppConfig();
const event = useEvent();
// Contact info now comes from PM One.
const contact = useProjectProfile();

usePageMeta(null, {
  title: "Quotation",
  description:
    "An event website that just works. Beautiful, easy to update, live the same hour you pay.",
});

useSeoMeta({
  robots: "noindex, nofollow",
});

const heroRef = ref(null);
const inView = useElementVisibility(heroRef);
const reducedMotion = usePreferredReducedMotion();
const shaderActive = computed(
  () => inView.value && reducedMotion.value !== "reduce",
);

const revealed = ref(false);
onMounted(() => {
  if (reducedMotion.value === "reduce") {
    revealed.value = true;
    return;
  }
  setTimeout(() => {
    revealed.value = true;
  }, 50);
});

const whatsappHref = computed(
  () =>
    `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(
      "Halo, saya tertarik dengan paket website Global AI Expo. Bisa diskusi lebih lanjut?",
    )}`,
);

const summary = [
  { label: "Setup", value: "A few days" },
  { label: "Goes live", value: "Same hour you pay" },
  { label: "Free edits", value: "Always" },
  { label: "Major revisions", value: "3 included" },
];

const overviewBuild = [
  "A look that fits your event, not a template",
  "Looks right on phones, tablets, and big screens",
  "Polished previews when shared on social",
  "Goes live the same hour you pay",
];

const overviewPlatform = [
  "Always-on hosting, fast everywhere",
  "Update content yourself, no developer needed",
  "Small edits are always free",
  "We handle the quiet upkeep",
];

const buildGroups = [
  {
    title: "Designed for your event",
    icon: "hugeicons:paint-brush-04",
    body: "Not a template. Tailored around your name, your audience, and the feel you want visitors to walk away with.",
  },
  {
    title: "Looks right everywhere",
    icon: "hugeicons:smart-phone-01",
    body: "Phones, tablets, laptops, big monitors. Especially the small screen most people will use to find you.",
  },
  {
    title: "Polished when shared",
    icon: "hugeicons:share-08",
    body: "Clean previews on WhatsApp, Instagram, and LinkedIn. Tidy URLs that look right on a poster or business card.",
  },
  {
    title: "Same-hour go-live",
    icon: "hugeicons:rocket-01",
    body: "We tailor the site first. Once you sign off and pay, it goes live the same hour, on your domain.",
  },
];

const platformGroups = [
  {
    title: "Hosting handled",
    icon: "hugeicons:cloud",
    body: "Always-on, fast worldwide. Security patches and updates run quietly in the background. No surprise downtime.",
  },
  {
    title: "Run the whole event from one screen",
    icon: "hugeicons:dashboard-square-01",
    body: "Exhibitors, sponsors, speakers, rundown, sessions, partners, brand pages, hotels, transfers, photos, videos, and blog posts. All in one place.",
  },
  {
    title: "Tickets, orders, guests",
    icon: "hugeicons:ticket-01",
    body: "Sell tickets, booths, and add-ons. Track orders and payment status. Apply promo codes. Import or export the guest list anytime.",
  },
  {
    title: "Inbox for leads",
    icon: "hugeicons:mail-02",
    body: "Contact-form messages, custom-form submissions, and exhibitor document uploads. Mark, reply, export.",
  },
  {
    title: "Tools that earn their keep",
    icon: "hugeicons:link-square-02",
    body: "Short links with click tracking. Page redirects. Sitemap. Polished previews when shared on social.",
  },
  {
    title: "Numbers you can show the boss",
    icon: "hugeicons:analytics-up",
    body: "Built-in visit and click tracking. Google Analytics 4 wired up. Export reports anytime.",
  },
  {
    title: "Team access",
    icon: "hugeicons:user-multiple-02",
    body: "Invite teammates with the right level of access. Activity log keeps a quiet record of who changed what.",
  },
  {
    title: "AI helper, built in",
    icon: "hugeicons:ai-chat-02",
    body: "A chat assistant for drafting copy, summarizing content, and quick answers. Right inside the dashboard.",
  },
];

const exclusions = [
  "Service charges from third parties",
  "Payment gateway fees per transaction",
  "On-site staff and event operations",
  "Domain registration and yearly renewal",
  "Tools or licenses requested beyond the standard build",
  "Photo, video, and copywriting (we add placeholders if you're not ready)",
];

const terms = [
  {
    title: "Payment",
    icon: "hugeicons:wallet-02",
    body: "Full payment unlocks the build. Live the same day it's signed off.",
  },
  {
    title: "Yours, always",
    icon: "hugeicons:license",
    body: "Your content, your brand, your domain. Stay yours, no lock-in tricks.",
  },
  {
    title: "Sixty days, then optional",
    icon: "hugeicons:shield-01",
    body: "Support and maintenance free for sixty days after launch. Need it longer? Extend for Rp 2.000.000 per month, anytime.",
  },
];
</script>

<style scoped>
.quotation-hero-content,
.quotation-hero-content :where(span, p, h1, h2, h3) {
  text-shadow:
    0 2px 24px rgba(0, 0, 0, 0.25),
    0 1px 3px rgba(0, 0, 0, 0.18);
}

.quotation-hero-content a:where([href]) {
  text-shadow: none;
}
</style>
