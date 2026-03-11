<template>
  <section
    id="hero"
    ref="containerRef"
    class="from-background via-kv-brown-200/60 to-background dark:via-kv-brown-900/60 relative isolate overflow-hidden bg-linear-to-b lg:bg-radial-[at_25%_25%]"
  >
    <div
      class="from-background to-background/0 absolute inset-x-0 top-0 z-0 h-[20%] bg-linear-to-b"
    ></div>
    <div
      class="from-background to-background/0 absolute inset-x-0 bottom-0 z-0 h-[20%] bg-linear-to-t"
    ></div>

    <div class="container-wider relative z-20">
      <div
        class="min-h-screen-offset relative isolate grid grid-cols-1 gap-x-4 gap-y-6 pt-6 md:grid-cols-2 md:items-end md:pt-0 xl:grid-cols-3"
      >
        <div
          class="3xl:gap-y-24 relative z-20 order-first flex h-full flex-col justify-between gap-y-6 sm:gap-y-12 md:pt-6 lg:pb-10 2xl:pt-10 2xl:pb-16"
        >
          <div class="flex flex-col items-start gap-y-2.5">
            <span class="text-primary/70 text-sm tracking-tight">{{
              content.countdownLabel
            }}</span>

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
              class="font-display text-primary mt-3 text-[clamp(3.5rem,5vw,7rem)] !leading-[1] text-balance"
            >
              <AccentRandomLetters>
                <!-- <SplitText
                  splitType="words, chars"
                  :delay="20"
                  :text="content.title"
                /> -->
                <span>{{ content.title }}</span>
              </AccentRandomLetters>
            </h1>

            <p
              class="text-primary max-w-xl text-base tracking-tight text-pretty sm:text-lg"
            >
              {{ content.description }}
            </p>

            <div class="mt-6 flex w-full gap-2 md:flex-wrap md:gap-3">
              <nuxt-link
                :to="localePath('/ticket')"
                class="bg-accent text-accent-foreground hover:bg-accent/80 flex items-center justify-center rounded-xl px-4 py-3 font-semibold tracking-tight transition active:scale-95 lg:rounded-2xl lg:px-6 lg:py-3"
                v-ripple
                >{{ $t("hero.ctaTicket") }}</nuxt-link
              >

              <nuxt-link
                :to="localePath('/book-space')"
                class="bg-accent/5 hover:bg-accent/10 dark:bg-accent/8 text-primary dark:border-primary/8 dark:hover:bg-primary/16 flex items-center justify-center rounded-xl border border-transparent px-4 py-3 font-semibold tracking-tight backdrop-blur-lg transition active:scale-95 lg:rounded-2xl lg:px-6 lg:py-3"
                v-ripple
                >{{ $t("hero.ctaExhibit") }}</nuxt-link
              >
            </div>
          </div>
        </div>

        <div
          class="relative isolate z-10 order-2 -mx-4 sm:mx-0 md:order-last md:col-span-2 md:pt-6 lg:pb-10 xl:order-2 xl:col-span-1 2xl:pt-10 2xl:pb-16"
        >
          <AnimatedShapes class="mx-auto max-w-sm" />
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
                <AccentRandomLetters>
                  <span
                    class="font-display relative isolate flex flex-col items-center text-7xl !leading-[0.9] text-balance md:items-end 2xl:text-8xl"
                  >
                    <span>{{ event.dateOnly }}</span>
                    <span>{{ event.month }}</span>
                    <span>{{ event.year }}</span>
                  </span>
                </AccentRandomLetters>
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
const event = useAppConfig().event;
const eventStartTime = computed(() => new Date(event.startTime));
const eventEndTime = computed(() => new Date(event.endTime));
const uiStore = useUiStore();
</script>
