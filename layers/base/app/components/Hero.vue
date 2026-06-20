<template>
  <section
    id="hero"
    ref="containerRef"
    class="from-background to-background via-background dark:via-muted relative isolate overflow-hidden bg-linear-to-b lg:bg-radial-[at_25%_25%]"
  >
    <div
      class="from-background to-background/0 absolute inset-x-0 top-0 z-0 h-[20%] bg-linear-to-b"
    ></div>
    <div
      class="from-background to-background/0 absolute inset-x-0 bottom-0 z-0 h-[20%] bg-linear-to-t"
    ></div>

    <div class="container-wider relative z-20">
      <div
        class="min-h-screen-offset relative isolate grid grid-cols-1 gap-x-4 gap-y-10 pt-6 md:grid-cols-2 md:items-end md:pt-0 xl:grid-cols-3"
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
          </div>

          <div class="flex flex-col items-start">
            <Announcement class="border-primary/30 text-primary border" />

            <h1
              class="text-foreground mt-5 text-4xl !leading-[1.2] font-medium tracking-tighter text-balance sm:text-5xl"
            >
              Accelerating Transformation in the Built Environment
            </h1>

            <p
              class="text-primary mt-3 max-w-xl text-base tracking-tight text-pretty sm:text-lg"
            >
              The enhanced edition of building materials, interior design,
              architecture, and construction exhibition & conference in
              Indonesia.
            </p>

            <div class="mt-6 flex w-full gap-2 md:flex-wrap md:gap-3">
              <nuxt-link
                :to="localePath('/tickets')"
                class="bg-primary text-primary-foreground hover:bg-primary/80 flex items-center justify-center rounded-xl px-4 py-3 font-semibold tracking-tight transition active:scale-95 lg:rounded-2xl lg:px-6 lg:py-3"
                v-ripple
                >Get ticket</nuxt-link
              >

              <nuxt-link
                :to="localePath('/book-space')"
                class="bg-primary/5 hover:bg-primary/10 dark:bg-primary/8 text-primary dark:border-primary/8 dark:hover:bg-primary/16 flex items-center justify-center rounded-xl border border-transparent px-4 py-3 font-semibold tracking-tight backdrop-blur-lg transition active:scale-95 lg:rounded-2xl lg:px-6 lg:py-3"
                v-ripple
                >I want to exhibit</nuxt-link
              >
            </div>
          </div>
        </div>

        <div
          class="relative isolate z-10 order-2 h-full md:order-last md:col-span-2 xl:order-2 xl:col-span-1"
        >
          <div
            class="xl:max-h-screen-offset relative -mx-4 overflow-hidden sm:mx-0"
          >
            <MarqueeGallery :rowsCount="6" />

            <div
              v-if="event.teaserVideoId"
              class="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full transition delay-1000 duration-800 ease-out starting:scale-0 starting:opacity-0"
            >
              <button
                class="flex size-16 items-center justify-center rounded-full bg-white/30 text-white shadow-xl outline -outline-offset-6 outline-white transition hover:bg-white/60 active:scale-98"
                @click="
                  uiStore.openEmbedVideoDialog(
                    `https://www.youtube.com/embed/${event.teaserVideoId}`,
                  )
                "
                v-ripple
              >
                <Icon
                  name="material-symbols:play-arrow-rounded"
                  class="size-8 shrink-0"
                />
              </button>
            </div>
          </div>
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
                  >{{ event.edition.value
                  }}<span class="align-super text-[10px]">{{
                    event.edition.ordinal
                  }}</span>
                  edition</span
                >
              </div>

              <div
                class="text-primary relative z-20 flex h-full w-full flex-col items-center text-center md:items-end md:text-right"
              >
                <span
                  class="relative isolate flex flex-col items-center text-7xl !leading-[0.9] font-semibold tracking-tighter text-balance uppercase md:items-end 2xl:text-8xl"
                >
                  <span>{{ event.dateOnly }}</span>
                  <span
                    class="before:gradient-accent relative text-white before:absolute before:-inset-2 before:z-[-1] before:-skew-x-16"
                    >{{ event.month }}</span
                  >
                  <span>{{ event.year }}</span>
                </span>
                <nuxt-link
                  :to="event.locationLink ?? ''"
                  target="_blank"
                  class="mt-4 text-xl font-semibold tracking-tighter text-balance decoration-dotted underline-offset-4 hover:underline"
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
