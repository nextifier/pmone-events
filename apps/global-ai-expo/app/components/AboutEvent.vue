<template>
  <div
    class="space-y-16 overflow-hidden lg:space-y-24"
    :class="{
      'pt-6': getRouteBaseName(route) === 'ticket',
    }"
  >
    <section
      id="about"
      ref="sectionRef"
      class="container-wider relative isolate"
    >
      <div class="flex flex-col gap-y-4">
        <h2
          class="section-title-large text-foreground relative isolate !leading-[1] font-semibold tracking-tighter text-balance"
          v-html="$t('about.sectionTitle')"
        ></h2>
      </div>

      <div
        ref="leadWrapRef"
        class="mt-8 grid grid-cols-12 gap-x-8 gap-y-8 lg:mt-16"
      >
        <div class="col-span-12 lg:col-span-7">
          <div
            ref="shaderWrapRef"
            :class="[
              'bg-primary ease-out-swift relative aspect-4/3 w-full overflow-hidden rounded-3xl transition-[clip-path] duration-[1600ms] will-change-transform sm:rounded-4xl',
              clipRevealed
                ? '[clip-path:inset(0_0_0_0)]'
                : '[clip-path:inset(0_100%_0_0)]',
            ]"
          >
            <Shader class="size-full" @ready="shaderReady = true">
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
          </div>
        </div>

        <div class="col-span-12 flex flex-col gap-y-5 lg:col-span-5 lg:pt-6">
          <span
            class="text-foreground inline-flex items-center gap-2 text-xl font-semibold tracking-tighter"
          >
            {{ $t("about.forgetBoring") }}
          </span>

          <p
            ref="leadRef"
            class="text-primary text-2xl !leading-[1.2] font-semibold tracking-tighter sm:text-3xl"
          >
            {{ $t("about.lead") }}
          </p>
        </div>
      </div>

      <div
        ref="statsRef"
        class="border-primary/10 mt-8 grid grid-cols-2 gap-y-10 border-y py-10 lg:grid-cols-4 lg:py-14"
      >
        <div
          v-for="(stat, index) in stats"
          :key="stat.label"
          class="lg:border-primary/10 flex flex-col gap-y-2 px-4 lg:px-8"
          :class="{ 'lg:border-l': index > 0 }"
        >
          <div
            class="text-primary text-5xl font-semibold tracking-tighter sm:text-6xl"
          >
            <span v-if="stat.prefix">{{ stat.prefix }}</span>
            <NumberFlow :value="statsActive ? stat.value : 0" />
            <span v-if="stat.suffix">{{ stat.suffix }}</span>
          </div>
          <span
            class="text-foreground/60 text-xs font-medium tracking-[0.18em] uppercase"
          >
            {{ stat.label }}
          </span>
        </div>
      </div>

      <div ref="bodyRef" class="mt-8 grid grid-cols-12 gap-x-8 gap-y-10">
        <p
          class="text-primary col-span-12 text-xl !leading-[1.4] font-medium tracking-tight sm:text-2xl lg:col-span-7 lg:col-start-1"
        >
          {{ $t("about.paragraph1") }}
        </p>
        <p
          class="text-primary col-span-12 text-xl !leading-[1.4] font-medium tracking-tight sm:text-2xl lg:col-span-5 lg:col-start-8"
        >
          {{ $t("about.paragraph2") }}
        </p>
        <p
          class="text-primary col-span-12 text-xl !leading-[1.4] font-medium tracking-tight sm:text-2xl lg:col-span-6 lg:col-start-2"
        >
          {{ $t("about.paragraph3") }}
        </p>
        <p
          class="text-primary col-span-12 text-xl !leading-[1.4] font-medium tracking-tight sm:text-2xl lg:col-span-7 lg:col-start-6"
        >
          {{ $t("about.paragraph4") }}
        </p>
      </div>
    </section>

    <WhyVisit />

    <MainPrograms />
  </div>
</template>

<script setup>
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Shader,
  Blob,
  ChromaticAberration,
  FilmGrain,
  Liquify,
  Swirl,
  WaveDistortion,
} from "shaders/vue";

gsap.registerPlugin(ScrollTrigger);

const route = useRoute();
const getRouteBaseName = useRouteBaseName();
const { t } = useI18n();

const sectionRef = ref(null);
const leadWrapRef = ref(null);
const shaderWrapRef = ref(null);
const leadRef = ref(null);
const statsRef = ref(null);
const bodyRef = ref(null);

const shaderReady = ref(false);
const statsActive = ref(false);
const clipRevealed = ref(false);

const stats = computed(() => [
  { value: 8, prefix: "", suffix: "", label: t("about.stats.zones") },
  { value: 100, prefix: "$", suffix: "K", label: t("about.stats.prize") },
  { value: 100, prefix: "", suffix: "+", label: t("about.stats.startups") },
  { value: 30, prefix: "", suffix: "+", label: t("about.stats.countries") },
]);

let ctx;

onMounted(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    statsActive.value = true;
    clipRevealed.value = true;
    return;
  }

  ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: shaderWrapRef.value,
      start: "top 60%",
      once: true,
      onEnter: () => {
        clipRevealed.value = true;
      },
    });

    gsap.to(shaderWrapRef.value, {
      yPercent: -10,
      ease: "none",
      scrollTrigger: {
        trigger: leadWrapRef.value,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });

    gsap.from(leadRef.value, {
      y: 60,
      opacity: 0,
      duration: 1.2,
      ease: "expo.out",
      scrollTrigger: {
        trigger: leadRef.value,
        start: "top 75%",
        once: true,
      },
    });

    gsap.from(bodyRef.value.querySelectorAll("p"), {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "expo.out",
      scrollTrigger: {
        trigger: bodyRef.value,
        start: "top 80%",
        once: true,
      },
    });

    ScrollTrigger.create({
      trigger: statsRef.value,
      start: "top 80%",
      once: true,
      onEnter: () => {
        statsActive.value = true;
      },
    });
  }, sectionRef.value);
});

onUnmounted(() => {
  if (ctx) ctx.revert();
});
</script>
