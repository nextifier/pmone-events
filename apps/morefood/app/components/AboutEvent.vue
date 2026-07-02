<template>
  <div
    class="space-y-16 overflow-hidden lg:space-y-24"
    :class="{
      'pt-6': getRouteBaseName(route) === 'ticket',
    }"
  >
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <h2
          class="text-foreground text-[clamp(3rem,20vw,10rem)] !leading-[1] font-extrabold tracking-tighter text-balance"
        >
          <SplitText
            splitType="words"
            ease="expo.out"
            :delay="150"
            :duration="2"
            class="pb-4 sm:pb-8"
            :text="$t('about.sectionTitle')"
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
            class="text-foreground inline-flex items-end gap-2 text-xl font-semibold tracking-tighter"
          >
            <span>{{ $t("about.forgetBoring") }}</span>
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
            class="text-foreground space-y-4 text-xl !leading-[1.3] font-semibold tracking-tighter sm:text-2xl"
          >
            <p>
              {{ $t("about.paragraph1") }}
            </p>
            <p>
              {{ $t("about.paragraph2") }}
            </p>
            <p>
              {{ $t("about.paragraph3") }}
            </p>
            <p>
              {{ $t("about.paragraph4") }}
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
const getRouteBaseName = useRouteBaseName();

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
