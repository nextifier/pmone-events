<template>
  <div ref="containerRef" class="relative isolate size-full">
    <div ref="chocolateSplash" class="relative z-10 size-full">
      <NuxtImg
        src="/img/chocolate-splash.png"
        alt=""
        class="pointer-events-none size-full object-contain select-none"
        width="1000"
        height="1376"
        sizes="400px lg:800px"
        format="webp"
      />
    </div>

    <div ref="chocolateBars" class="absolute inset-0 z-20 size-full">
      <NuxtImg
        src="/img/chocolate-bars.png"
        alt=""
        class="pointer-events-none size-full scale-120 object-contain select-none"
        width="1000"
        height="1137"
        sizes="400px lg:800px"
        format="webp"
      />
    </div>
  </div>
</template>

<script setup>
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const isInitialized = ref(false);
const containerRef = ref(null);
const chocolateSplash = ref(null);
const chocolateBars = ref(null);
let ctx;

const initializeAnimation = async () => {
  if (typeof window === "undefined") return;

  await nextTick();

  gsap.registerPlugin(ScrollTrigger);

  ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.value,
        start: "bottom 95%",
        end: "bottom 50%",
        scrub: 1,
        // markers: true,
      },
      //   delay: 0.3,
    });

    tl.to(chocolateBars.value, {
      duration: 2,
      scale: 1.5,
      rotate: -6,
      ease: "none",
    }).to(
      chocolateSplash.value,
      {
        duration: 2,
        yPercent: 25,
        scale: 1.2,
        ease: "none",
      },
      "-=2",
    );

    isInitialized.value = true;
  }, containerRef.value);
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
