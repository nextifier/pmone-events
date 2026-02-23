<template>
  <div
    class="space-y-16 overflow-hidden lg:space-y-24"
    :class="{
      'pt-6': ['ticket'].includes(route.name),
    }"
  >
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <h2
          class="text-[clamp(3rem,20vw,10rem)] !leading-[1] font-extrabold tracking-tighter text-balance"
        >
          <SplitText
            splitType="words"
            ease="expo.out"
            :delay="150"
            :duration="2"
            class="pb-4 sm:pb-8"
            :text="`
            <span class='text-accent'>More</span>
            <span class='text-outline'> than just a</span>
            <span class='text-accent'> Food</span>
            <span class='text-outline'> Expo</span>
            `"
          />
        </h2>
      </div>

      <div
        ref="containerRef"
        class="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-2"
      >
        <div ref="aboutImgRef">
          <NuxtImg
            src="/img/kv/food-24.png"
            alt=""
            class="pointer-events-none w-full select-none"
            width="1080"
            height="1080"
            sizes="100vw lg:500px"
            format="webp"
            loading="lazy"
          />
        </div>

        <div class="flex flex-col items-start gap-y-4">
          <span
            class="inline-flex items-end gap-2 text-xl font-semibold tracking-tighter"
          >
            <span>Forget boring trade shows</span>
            <NuxtImg
              src="/img/kv/monkey-sleep.png"
              alt=""
              class="pointer-events-none h-12 w-auto select-none sm:h-16"
              width="600"
              height="596"
              sizes="48px sm:64px"
              format="webp"
              loading="lazy"
            />
          </span>
          <div
            class="text-primary space-y-4 text-3xl !leading-[1.3] font-semibold tracking-tighter sm:text-4xl"
          >
            <p>
              MoreFood Expo Indonesia brings together global suppliers and Asian
              buyers in one powerful sourcing platform.
            </p>
            <p>
              The exhibition features key sectors including Food Machinery &
              Packaging, Food Ingredients, Supply Chain Solutions, Canned &
              Packaged Food, Condiments, Bakery, Snacks, Sweets, Beverages, and
              more.
            </p>
            <p>
              Discover innovative technologies, explore high-quality products,
              connect with trusted manufacturers, and unlock real business
              opportunities, all in one venue.
            </p>
            <p>
              Register today! Expand your network and source the right partners
              for your business at MoreFood Expo 2026.
            </p>
          </div>
        </div>
      </div>
    </div>

    <WhyVisit />

    <MainPrograms />
  </div>
</template>

<script setup>
const route = useRoute();

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const containerRef = ref(null);
const aboutImgRef = ref(null);

let ctx;

onMounted(() => {
  ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.value,
        start: "top center",
        end: "bottom 75%",
        scrub: 1,
      },
    });

    tl.to(
      aboutImgRef.value,
      {
        yPercent: -60,
        scale: 1.2,
      },
      "<",
    );
  }, containerRef.value);
});

onUnmounted(() => {
  if (ctx) {
    ctx.revert();
  }
});
</script>
