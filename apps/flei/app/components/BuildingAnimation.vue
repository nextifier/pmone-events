<template>
  <div ref="buildingContainer" class="relative w-full">
    <div
      class="relative z-0 w-full [clip-path:inset(-100%_-100%_0_-100%)]"
      :class="isInitialized ? 'visible' : 'invisible'"
    >
      <div
        ref="buildingBlur"
        class="animation-duration-4000 absolute inset-0 hidden aspect-square animate-pulse rounded-full bg-cyan-400/24 blur-[48px] dark:block"
      ></div>
      <div class="relative isolate flex w-full shrink-0 flex-col items-center">
        <div ref="buildingLines" class="absolute inset-0 z-20">
          <BuildingLines
            class="mx-auto h-auto w-full max-w-2xl text-gray-300 dark:text-white/40"
          />
        </div>
        <div ref="building" class="relative z-30 w-full">
          <NuxtImg
            src="/img/kv/buildings.svg"
            alt=""
            class="pointer-events-none mx-auto w-full max-w-[400px] select-none"
            width="378"
            height="189"
          />
        </div>
      </div>
    </div>
    <div
      ref="horizontalLine"
      class="absolute inset-x-0 bottom-0 z-10 mx-auto w-full translate-y-full"
      :class="isInitialized ? 'visible' : 'invisible'"
    >
      <div
        class="absolute inset-x-0 top-0 mx-auto h-0.5 w-full bg-linear-to-r from-transparent via-indigo-500 to-transparent blur-sm"
      />
      <div
        class="absolute inset-x-0 top-0 mx-auto h-0.5 w-full bg-linear-to-r from-transparent via-indigo-500 to-transparent"
      />
      <div
        class="absolute inset-x-10 top-0 mx-auto h-1.5 w-1/2 bg-linear-to-r from-transparent via-sky-500 to-transparent blur-xs"
      />
      <div
        class="absolute inset-x-10 top-0 mx-auto h-0.5 w-3/4 bg-linear-to-r from-transparent via-sky-500 to-transparent"
      />
    </div>
  </div>
</template>

<script setup>
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const isInitialized = ref(false);
const buildingContainer = ref(null);
const horizontalLine = ref(null);
const buildingBlur = ref(null);
const building = ref(null);
const buildingLines = ref(null);

let ctx;

const initializeAnimation = async () => {
  if (typeof window === "undefined") return;

  await nextTick();

  gsap.registerPlugin(ScrollTrigger);

  ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: buildingContainer.value,
        toggleActions: "play none none none",
        start: "top 60%",
        end: "+=500",
        once: true,
        // markers: true,
      },
      delay: 0.3,
    });

    tl.from(horizontalLine.value, {
      scaleX: 0,
      duration: 2.5,
      ease: "power3.out",
    })
      .from(
        building.value,
        {
          yPercent: 100,
          duration: 2,
          ease: "power1.out",
          force3D: true,
        },
        "-=2",
      )
      .from(
        buildingLines.value,
        {
          scaleX: 0,
          duration: 2,
          ease: "power1.out",
          force3D: true,
        },
        "-=1.8",
      )
      .from(
        buildingBlur.value,
        {
          autoAlpha: 0,
          scale: 0,
          duration: 2,
          ease: "power3.out",
          force3D: true,
        },
        "-=1",
      );

    isInitialized.value = true;
  }, buildingContainer.value);
};

onMounted(() => {
  initializeAnimation();
});

onUnmounted(() => {
  if (ctx) {
    ctx.revert();
  }
});
</script>
