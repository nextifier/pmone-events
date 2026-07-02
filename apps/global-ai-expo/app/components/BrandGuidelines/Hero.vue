<template>
  <section
    id="brand-hero"
    class="sm:container-wider relative isolate p-1 sm:pt-4"
  >
    <div
      ref="heroRef"
      class="bg-primary brand-hero-shader relative isolate overflow-hidden rounded-3xl"
    >
      <div
        :class="[
          'absolute inset-0 transition-[clip-path] duration-[1400ms] ease-out delay-200',
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
        class="brand-hero-content relative z-10 flex min-h-[600px] flex-col items-center justify-center gap-y-6 px-3 py-20 text-center text-white sm:min-h-[680px] sm:gap-y-8 sm:px-6 sm:py-28 lg:min-h-[760px] lg:py-32"
      >
        <div
          class="inline-flex w-fit items-center gap-x-2 rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-base font-medium tracking-tight text-white text-shadow-xs"
        >
          <span class="size-1.5 rounded-full bg-white"></span>
          Brand · v1
        </div>

        <h1
          class="text-[14vw] !leading-[0.9] font-semibold tracking-[-0.05em] text-balance text-white sm:text-7xl lg:text-[6.5rem] xl:text-[7.5rem]"
        >
          Brand Guidelines
        </h1>

        <p
          class="max-w-xl text-base !leading-relaxed font-medium tracking-tight text-pretty text-white sm:text-lg lg:text-xl"
        >
          Logo, color, type, motion, and copy rules for {{ event.title }}. Use
          this page when you build anything with our name on it.
        </p>

        <div
          class="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          <a
            href="#brand-logo"
            class="inline-flex items-center gap-x-2 rounded-full bg-white px-5 py-3 text-base font-medium tracking-tight text-black transition-colors hover:bg-white/90"
          >
            Jump to assets
            <Icon name="hugeicons:arrow-down-01" class="size-4" />
          </a>
        </div>
      </div>

      <div
        class="brand-hero-content absolute inset-x-6 bottom-6 z-10 flex items-end justify-between gap-3"
      >
        <span
          class="inline-flex w-fit items-center gap-x-2 rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-base font-medium tracking-tight text-white text-shadow-xs"
        >
          /brand-guidelines
        </span>
        <span
          class="inline-flex w-fit items-center gap-x-2 rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-base font-medium tracking-tight text-white text-shadow-xs"
        >
          ~60fps
        </span>
      </div>
    </div>

    <div
      class="border-foreground/10 mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border sm:grid-cols-4"
    >
      <div
        v-for="(item, idx) in summary"
        :key="item.label"
        class="border-foreground/10 flex flex-col gap-y-1 p-5"
        :class="{
          'sm:border-l': idx > 0,
          'border-t sm:border-t-0': idx >= 2,
          'border-l': idx === 1 || idx === 3,
        }"
      >
        <span class="text-muted-foreground text-sm font-medium tracking-tight">
          {{ item.label }}
        </span>
        <span class="text-foreground text-base font-medium tracking-tighter">
          {{ item.value }}
        </span>
      </div>
    </div>
  </section>
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

const event = useEvent();

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

const summary = [
  { label: "Typeface", value: "MinusOne" },
  { label: "Logo", value: "Mark + Wordmark" },
  { label: "Palette", value: "Neutral shades + futuristic accent colors" },
  { label: "Updated", value: `April ${event.year}` },
];
</script>

<style scoped>
.brand-hero-content,
.brand-hero-content :where(span, p, h1, h2, h3) {
  text-shadow:
    0 2px 24px rgba(0, 0, 0, 0.25),
    0 1px 3px rgba(0, 0, 0, 0.18);
}

.brand-hero-content a:where([href]) {
  text-shadow: none;
}
</style>
