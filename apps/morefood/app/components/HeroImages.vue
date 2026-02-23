<template>
  <div ref="containerRef" class="relative isolate">
    <div ref="mainImageRef">
      <NuxtImg
        src="/img/kv/food-1.png"
        alt="Main dish"
        class="pointer-events-none relative z-10 w-full origin-top select-none"
        width="1080"
        height="1080"
        sizes="100vw lg:1000px"
        format="webp"
        priority
      />
    </div>

    <div
      ref="childImage1Ref"
      class="absolute top-[4%] left-[17%] z-12 w-[240px] -rotate-8"
    >
      <NuxtImg
        src="/img/kv/food-9.png"
        alt="Side dish 1"
        class="pointer-events-none select-none"
        width="240"
        height="240"
        sizes="240px"
        format="webp"
      />
    </div>

    <div
      ref="childImage2Ref"
      class="absolute top-[0%] right-[14%] z-11 w-[200px] rotate-15 xl:right-[16%]"
    >
      <NuxtImg
        src="/img/kv/food-8.png"
        alt="Side dish 2"
        class="pointer-events-none select-none"
        width="240"
        height="240"
        sizes="200px"
        format="webp"
      />
    </div>

    <div
      ref="childImage3Ref"
      class="absolute right-[20%] bottom-[15%] z-9 w-[200px] xl:right-[12%]"
    >
      <NuxtImg
        src="/img/kv/food-7.png"
        alt="Side dish 3"
        class="pointer-events-none select-none"
        width="240"
        height="240"
        sizes="200px"
        format="webp"
      />
    </div>
  </div>
</template>

<script setup>
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const containerRef = ref(null);
const mainImageRef = ref(null);
const childImage1Ref = ref(null);
const childImage2Ref = ref(null);
const childImage3Ref = ref(null);

let ctx;

onMounted(() => {
  ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.value,
        start: "top-=56px top",
        end: "bottom top",
        scrub: 1,
        // markers: true,
      },
    });

    // The position parameter "<" makes all animations start at the same time.

    tl.to(
      mainImageRef.value,
      {
        yPercent: -20,
        scale: 1.2,
      },
      "<",
    );

    tl.to(
      childImage1Ref.value,
      {
        yPercent: 100,
        xPercent: -100,
        scale: 0.8,
        rotate: 0,
      },
      "<",
    );

    tl.to(
      childImage2Ref.value,
      {
        yPercent: 100,
        xPercent: 100,
        scale: 0.8,
        rotate: 0,
      },
      "<",
    );

    tl.to(
      childImage3Ref.value,
      {
        yPercent: -100,
        xPercent: 100,
        scale: 0.8,
        rotate: 0,
      },
      "<",
    );
  }, containerRef.value); // Scope the context to the main container
});

onUnmounted(() => {
  // Clean up the GSAP context and all associated animations and ScrollTriggers.
  if (ctx) {
    ctx.revert();
  }
});
</script>
