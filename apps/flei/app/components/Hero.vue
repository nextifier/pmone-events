<template>
  <section
    id="hero"
    ref="containerRef"
    class="from-background to-background relative isolate bg-linear-to-b via-blue-100/0 lg:bg-radial-[at_25%_25%] dark:via-blue-950/50"
  >
    <div
      class="from-background to-background/0 absolute inset-x-0 top-0 z-0 h-[20%] bg-linear-to-b"
    ></div>
    <div
      class="from-background to-background/0 absolute inset-x-0 bottom-0 z-0 h-[20%] bg-linear-to-t"
    ></div>

    <!-- <div
      class="pointer-events-none absolute bottom-0 left-0 z-0 size-[600px] rotate-90 lg:size-[30vw]"
    >
      <GlowCard variant="crescent" class="size-full" />
    </div> -->

    <div
      class="pointer-events-none absolute bottom-0 left-0 z-0 size-[600px] scale-110 rotate-90 lg:size-[30vw]"
    >
      <Orb
        :hoverIntensity="0.5"
        :rotateOnHover="true"
        :hue="8"
        :forceHoverState="false"
      />
    </div>

    <!-- <div
      class="pointer-events-none absolute top-24 right-0 z-0 size-[700px] rotate-315 lg:top-16 lg:size-[27vw]"
    >
      <GlowCard variant="crescent" class="size-full" />
    </div> -->

    <div
      class="absolute top-24 right-0 z-0 size-[700px] scale-110 rotate-315 lg:top-16 lg:size-[27vw]"
    >
      <Orb
        :hoverIntensity="0.5"
        :rotateOnHover="true"
        :hue="8"
        :forceHoverState="true"
      />
    </div>

    <div class="container-wider relative z-20">
      <div
        class="min-h-screen-offset relative isolate grid grid-cols-1 gap-y-6 pt-6 md:grid-cols-2 md:items-end md:pt-0 xl:grid-cols-3"
      >
        <div
          class="relative z-20 order-first flex h-full flex-col justify-between gap-y-6 sm:gap-y-12 md:pt-6 lg:pb-10 2xl:pt-10 2xl:pb-16"
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

            <button
              v-if="event.teaserVideoId"
              class="bg-primary/5 hover:bg-primary/10 dark:bg-primary/8 text-primary dark:border-primary/8 dark:hover:bg-primary/16 mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-transparent px-3 py-3 text-sm font-semibold tracking-tight backdrop-blur-lg transition active:scale-95 lg:rounded-2xl lg:px-6 lg:py-3"
              @click="
                uiStore.openEmbedVideoDialog(
                  `https://www.youtube.com/embed/${event.teaserVideoId}`,
                )
              "
              v-ripple
            >
              <Icon name="hugeicons:play-circle" class="size-5 shrink-0" />
              <span>{{ $t("hero.playRecap") }}</span>
            </button>
          </div>

          <div class="flex flex-col items-start">
            <Announcement class="border-primary/30 text-primary border" />

            <h1
              class="text-primary mt-4 text-[clamp(2.5rem,4vw,4rem)] leading-[1.15]! font-medium tracking-[-0.06em] text-balance"
            >
              {{ content.title }}
            </h1>

            <p
              class="text-primary mt-4 max-w-xl text-base tracking-tight text-pretty sm:text-lg"
            >
              {{ content.description }}
            </p>

            <div class="mt-6 flex w-full gap-2 md:flex-wrap md:gap-3">
              <nuxt-link
                :to="localePath('/tickets')"
                class="bg-primary text-primary-foreground hover:bg-primary/80 flex items-center justify-center rounded-lg px-4 py-2 font-semibold tracking-tight transition active:scale-98"
                v-ripple
                >{{ $t("hero.ctaTicket") }}</nuxt-link
              >

              <nuxt-link
                :to="localePath('/book-space')"
                class="bg-primary/5 hover:bg-primary/10 dark:bg-primary/8 text-primary dark:border-primary/8 dark:hover:bg-primary/16 flex items-center justify-center rounded-lg border border-transparent px-4 py-2 font-semibold tracking-tight backdrop-blur-lg transition active:scale-98"
                v-ripple
                >{{ $t("hero.ctaExhibit") }}</nuxt-link
              >
            </div>
          </div>
        </div>

        <div
          class="relative isolate z-10 order-2 -mx-10 flex h-full items-center justify-center md:order-last md:col-span-2 lg:-mx-[40%] xl:order-2 xl:col-span-1"
        >
          <HeroVisual26th class="w-auto" />
        </div>

        <div
          class="relative z-30 order-3 h-full md:order-2 md:pt-6 lg:pb-10 xl:order-last 2xl:pt-10 2xl:pb-16"
        >
          <div
            class="relative ml-auto flex size-full flex-col justify-between gap-y-6"
          >
            <BannerHero class="relative z-20 w-full" />

            <div
              class="relative isolate z-10 flex flex-col items-center gap-y-4 text-center md:items-end md:text-right"
            >
              <div v-if="event.edition?.value" class="flex">
                <span
                  class="text-primary bg-muted rounded-full px-3 py-2 text-sm tracking-tight dark:bg-white/10"
                  >{{
                    $t("hero.edition", {
                      n: event.edition.value,
                      ordinal: event.edition.ordinal,
                    })
                  }}</span
                >
              </div>

              <div
                class="text-primary relative z-20 flex h-full w-full flex-col items-center text-center md:items-end md:text-right"
              >
                <span
                  class="relative isolate flex flex-col items-center text-7xl !leading-[1] font-semibold tracking-tighter text-balance md:items-end 2xl:text-8xl"
                >
                  <span>{{ event.dateOnly }}</span>
                  <!-- <span
                    class="relative text-white before:absolute before:-inset-2 before:z-[-1] before:rounded-l-[3rem] before:rounded-r-3xl before:bg-linear-to-r before:from-pink-500 before:to-pink-600"
                    >{{ event.month }}</span
                  > -->
                  <span>{{ event.month }}</span>
                  <span>{{ event.year }}</span>
                </span>
                <nuxt-link
                  :to="event.locationLink ?? ''"
                  target="_blank"
                  class="mt-4 text-xl font-bold tracking-tighter text-balance decoration-dotted underline-offset-4 hover:underline"
                  >{{ event.location }}</nuxt-link
                >
                <span
                  v-if="event.hall"
                  class="mt-2 line-clamp-1 text-sm tracking-tight"
                  >{{ event.hall }}</span
                >
              </div>

              <InConjunction
                v-if="event?.inConjunction?.list?.length"
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
</script>
