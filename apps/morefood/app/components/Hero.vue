<template>
  <section
    id="hero"
    ref="containerRef"
    class="from-background to-background relative isolate bg-linear-to-b via-red-100/90 lg:bg-radial-[at_25%_25%] dark:via-red-950/80"
  >
    <div
      class="from-background to-background/0 absolute inset-x-0 top-0 z-0 h-[20%] bg-linear-to-b"
    ></div>
    <div
      class="from-background to-background/0 absolute inset-x-0 bottom-0 z-0 h-[20%] bg-linear-to-t"
    ></div>

    <div class="container-wider relative z-20">
      <div
        class="min-h-screen-offset relative isolate grid grid-cols-1 gap-y-6 pt-6 md:grid-cols-2 md:items-end md:pt-0 xl:grid-cols-3 xl:items-start"
      >
        <div
          class="xl:max-h-screen-offset relative z-20 order-first flex h-full flex-col justify-between gap-y-6 sm:gap-y-12 md:pt-6 lg:pb-10 2xl:pt-10 2xl:pb-16"
        >
          <div class="flex flex-col items-start gap-y-2.5">
            <span
              v-if="eventStatus === 'upcoming'"
              class="text-primary/70 text-sm tracking-tight"
              >{{ content.countdownLabel }}</span
            >

            <EventStatus
              countdownVariant="inline-with-boxes"
              :withTextPrefix="false"
              class="h-8 sm:h-9"
              :startTime="eventStartTime"
              :endTime="eventEndTime"
            />

          </div>

          <div class="flex flex-col items-start">
            <span class="section-subtitle">{{ content.subtitle }}</span>

            <h1
              class="text-primary mt-2 text-[clamp(2.5rem,4.5vw,4.5rem)] leading-[1.15]! font-medium tracking-[-0.06em] text-balance"
            >
              <!-- <SplitText :text="content.title" /> -->
              {{ content.title }}
            </h1>

            <p class="section-description mt-3">
              {{ content.description }}
            </p>

            <div class="mt-6 flex w-full gap-2 md:flex-wrap md:gap-3">
              <nuxt-link
                :to="localePath('/tickets')"
                class="bg-primary text-primary-foreground hover:bg-primary/80 flex items-center justify-center rounded-xl px-4 py-3 font-semibold tracking-tight transition active:scale-95 lg:rounded-2xl lg:px-6 lg:py-3"
                v-ripple
                >{{ $t("hero.ctaTicket") }}</nuxt-link
              >

              <nuxt-link
                :to="localePath('/book-space')"
                class="bg-primary/5 hover:bg-primary/10 dark:bg-primary/8 text-primary border-primary/8 dark:hover:bg-primary/16 flex items-center justify-center rounded-xl px-4 py-3 font-semibold tracking-tight backdrop-blur-lg transition active:scale-95 lg:rounded-2xl lg:px-6 lg:py-3 dark:border"
                v-ripple
                >{{ $t("hero.ctaExhibit") }}</nuxt-link
              >
            </div>
          </div>
        </div>

        <div
          class="relative isolate z-10 order-2 -mx-[40%] h-full md:order-last md:col-span-2 xl:order-2 xl:col-span-1"
        >
          <div class="relative isolate z-30">
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
        </div>

        <div
          class="xl:max-h-screen-offset relative z-30 order-3 h-full md:order-2 md:pt-6 lg:pb-10 xl:order-last 2xl:pt-10 2xl:pb-16"
        >
          <div
            class="relative ml-auto flex size-full flex-col justify-between gap-y-6"
          >
            <BannerHero class="relative z-20 w-full" />

            <div
              class="relative isolate z-10 flex flex-col items-center gap-y-4 text-center md:items-end md:text-right"
            >
              <div
                class="transition duration-300 hover:scale-105 active:scale-95"
              >
                <NuxtImg
                  src="/img/kv/food-11-cropped.png"
                  alt=""
                  class="pointer-events-none w-full max-w-[280px] select-none"
                  width="1064"
                  height="464"
                  sizes="280px"
                  format="webp"
                />
              </div>

              <div
                class="text-primary relative z-20 flex h-full w-full flex-col"
              >
                <span
                  class="3xl:text-8xl flex flex-col text-7xl leading-[0.9]! font-medium tracking-tighter text-balance uppercase"
                >
                  <!-- <SplitText
                    splitType="lines"
                    ease="expo.out"
                    :delay="100"
                    :duration="1.5"
                    :from="{ opacity: 0, yPercent: 100, x: 40 }"
                    :to="{ opacity: 1, yPercent: 0, x: 0 }"
                    :text="`
                      <span>7-10</span><br/>
                      <span class='text-red-600'>May</span><br/>
                      <span>2026</span>
                    `"
                  /> -->
                  <span>{{ event.dateOnly }}</span>
                  <span class="font-bold text-red-600">{{ event.month }}</span>
                  <span>{{ event.year }}</span>
                </span>
                <span
                  class="mt-4 line-clamp-1 text-xl font-semibold tracking-tighter"
                  >{{ event.location }}</span
                >
                <span
                  v-if="event.hall"
                  class="mt-2 line-clamp-1 text-sm tracking-tight"
                  >{{ event.hall }}</span
                >
              </div>

              <InConjunction
                class="flex flex-col items-center text-center md:items-end md:text-right"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const localePath = useLocalePath();
const content = computed(() => useContentStore().components.hero);
const event = useEvent();
const eventStartTime = computed(() => new Date(event.startTime));
const eventEndTime = computed(() => new Date(event.endTime));
const { status: eventStatus } = useEventStatus(eventStartTime, eventEndTime);
const uiStore = useUiStore();

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
