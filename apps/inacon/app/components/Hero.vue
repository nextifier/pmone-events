<template>
  <section id="hero" class="relative isolate overflow-hidden">
    <KVHalftone
      class="text-foreground/5 absolute inset-x-0 bottom-0 z-0 w-full xl:translate-y-[40%]"
    />

    <div
      class="from-background to-background/0 absolute inset-x-0 top-0 z-0 h-[20%] bg-linear-to-b"
    ></div>
    <div
      class="from-background to-background/0 absolute inset-x-0 bottom-0 z-0 h-[20%] bg-linear-to-t"
    ></div>

    <div class="container-wider relative z-20 xl:pb-40">
      <div
        class="min-h-screen-offset grid grid-cols-1 gap-y-10 pt-6 md:grid-cols-2 md:items-center md:pt-4 xl:grid-cols-3"
      >
        <div
          class="order-first flex h-full flex-col gap-y-10 md:justify-start xl:pb-32 2xl:pt-4 2xl:pb-24"
          :class="
            event.startTime
              ? 'justify-between xl:justify-between'
              : 'justify-start xl:justify-end'
          "
        >
          <div
            v-if="event.startTime"
            class="flex flex-col items-start gap-y-2.5"
          >
            <!-- <span class="text-foreground/70 text-sm tracking-tight">{{
              content.countdownLabel
            }}</span> -->

            <EventStatus
              countdownVariant="text-with-shadow"
              class="h-[3.375rem]"
              :withTextPrefix="false"
              :startTime="eventStartTime"
              :endTime="eventEndTime"
            />
          </div>

          <div class="flex flex-col items-start">
            <span
              class="bg-accent text-accent-foreground inline-flex items-center gap-x-1.5 px-3 py-1.5 text-xs font-semibold tracking-tight uppercase shadow-[0.3rem_0.3rem_0_0] shadow-black/85 sm:text-sm dark:shadow-white/15"
            >
              {{ content.subHeadline }}
            </span>

            <h1
              class="3xl:text-7xl text-foreground mt-4 text-5xl !leading-[1] font-medium tracking-tighter text-balance sm:text-6xl xl:text-6xl"
            >
              {{ content.title }}
            </h1>

            <p class="section-description mt-4 !max-w-md">
              {{ content.description }}
            </p>

            <div class="mt-6 flex w-full gap-2 md:flex-wrap md:gap-3">
              <nuxt-link
                :to="localePath('/tickets')"
                class="bg-primary text-primary-foreground hover:bg-primary/80 flex basis-1/2 items-center justify-center rounded-xl px-4 py-2.5 font-semibold tracking-tighter transition active:scale-95 md:basis-auto lg:px-8"
                v-ripple
                >{{ $t("hero.ctaTicket") }}</nuxt-link
              >

              <nuxt-link
                :to="localePath('/book-space')"
                class="bg-primary/5 hover:bg-primary/10 dark:bg-primary/8 text-primary border-primary/8 dark:hover:bg-primary/16 flex basis-1/2 items-center justify-center rounded-xl px-4 py-2.5 font-semibold tracking-tighter backdrop-blur-lg transition active:scale-95 md:basis-auto lg:px-8 dark:border"
                v-ripple
                >{{ $t("hero.ctaExhibit") }}</nuxt-link
              >
            </div>
          </div>
        </div>

        <div
          class="relative isolate order-2 h-full md:order-last md:col-span-2 xl:order-2 xl:col-span-1"
        >
          <KVCircle
            class="absolute top-1/2 left-1/2 z-0 w-full -translate-x-1/2 -translate-y-1/2 animate-[spin_10s_linear_infinite]"
          />
          <NuxtImg
            src="/img/mascots/mascot-inacon-together-2.png"
            alt=""
            class="xs:scale-[120%] pointer-events-none relative z-10 w-full origin-top scale-[130%] select-none md:scale-100 xl:scale-[140%] dark:contrast-115 dark:drop-shadow-[0px_0px_10px_rgba(0,0,0,0.8)]"
            width="1081"
            height="1519"
            sizes="100vw sm:600px xl:900px"
            format="webp"
          />
        </div>

        <div
          class="order-3 h-full pt-32 sm:pt-0 md:order-2 xl:order-last xl:pb-10 2xl:pt-4 2xl:pb-16"
        >
          <div
            class="relative isolate ml-auto flex h-full w-full flex-col justify-between gap-y-48 lg:max-w-md"
          >
            <BannerHero class="relative z-20 w-full" />

            <div
              class="xs:max-w-[22rem] relative isolate z-10 aspect-square w-full xl:ml-auto"
            >
              <div
                class="absolute inset-x-0 bottom-0 z-0 translate-x-[0%] -translate-y-[6%]"
              >
                <NuxtImg
                  src="/img/mascots/mascot-together-01.png"
                  alt=""
                  class="pointer-events-none relative z-10 w-full select-none"
                  width="800"
                  height="1200"
                  sizes="400px"
                  format="webp"
                />
              </div>

              <KVRectangle
                class="absolute inset-0 z-10 size-full fill-black/90 stroke-white/20 stroke-1 dark:fill-white/80 dark:stroke-white"
              />

              <div
                class="text-primary-foreground relative z-20 flex h-full flex-col items-start justify-center px-7 py-10"
              >
                <span class="line-clamp-1 text-lg tracking-tight">{{
                  event.title
                }}</span>
                <template v-if="event.startTime">
                  <div
                    class="mt-3 line-clamp-3 flex flex-col text-[4rem] !leading-[0.9] tracking-tighter text-balance uppercase"
                  >
                    <span>{{ event.dateOnly }}</span>
                    <span>{{ event.month }}</span>
                    <span>{{ event.year }}</span>
                  </div>
                  <span
                    class="mt-4 line-clamp-1 text-xl font-bold tracking-tighter"
                    >{{ event.locationShort }}</span
                  >
                  <span class="mt-1 line-clamp-1 text-sm tracking-tight">{{
                    event.hall
                  }}</span>
                </template>
                <template v-else>
                  <div
                    class="mt-3 flex flex-col text-[4rem] !leading-[0.9] font-medium tracking-tighter text-balance uppercase"
                  >
                    <span
                      v-for="(word, i) in $t('ui.comingSoon').split(' ')"
                      :key="i"
                      >{{ word }}</span
                    >
                  </div>
                  <span class="mt-4 text-sm tracking-tight text-balance">{{
                    $t("hero.datesTba", "Dates and venue to be announced.")
                  }}</span>
                </template>
              </div>
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
const uiStore = useUiStore();
</script>
