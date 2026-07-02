<template>
  <section
    id="hero"
    class="container-wider xl:min-h-screen-offset relative isolate grid grid-cols-1 gap-y-14 overflow-hidden md:grid-cols-2 xl:grid-cols-3"
  >
    <div
      class="xl:max-h-screen-offset order-first flex flex-col gap-y-10 pt-4 xl:h-full xl:justify-between xl:pb-8 2xl:pb-12"
    >
      <div class="flex flex-col items-start gap-y-1.5">
        <span
          v-if="eventStatus === 'upcoming'"
          class="font-semibold tracking-tighter"
          >{{ content.countdownLabel }}</span
        >

        <EventStatus
          countdownVariant="text-with-shadow"
          class="h-[3.375rem]"
          :withTextPrefix="false"
          :startTime="eventStartTime"
          :endTime="eventEndTime"
        />
      </div>

      <div class="flex flex-col items-start">
        <span class="text-accent font-semibold tracking-tighter">{{
          content.subHeadline
        }}</span>

        <h1
          class="font-display 3xl:text-7xl text-foreground mt-1 text-5xl leading-none! tracking-[-0.06em] text-balance sm:text-6xl xl:text-6xl"
        >
          {{ content.title }}
        </h1>

        <p class="section-description mt-4">
          {{ content.description }}
        </p>

        <div class="mt-6 flex w-full gap-2 md:flex-wrap md:gap-3">
          <nuxt-link
            :to="localePath('/tickets')"
            class="bg-primary text-primary-foreground hover:bg-primary/80 border-primary hover:border-primary/80 flex basis-1/2 items-center justify-center rounded-tl-xl border-2 px-4 py-2.5 font-semibold tracking-tighter transition [corner-shape:bevel] active:scale-95 md:basis-auto lg:px-8"
            v-ripple
            >{{ $t("hero.ctaTicket") }}</nuxt-link
          >

          <nuxt-link
            :to="localePath('/book-space')"
            class="hover:bg-muted text-foreground border-foreground flex basis-1/2 items-center justify-center rounded-br-xl border-2 px-4 py-2.5 font-semibold tracking-tighter backdrop-blur-lg transition [corner-shape:bevel] active:scale-95 md:basis-auto lg:px-8"
            v-ripple
            >{{ $t("hero.ctaExhibit") }}</nuxt-link
          >
        </div>
      </div>
    </div>

    <div
      class="relative isolate order-2 h-full md:order-last md:col-span-2 xl:order-2 xl:col-span-1 xl:py-6"
    >
      <HeroVisual />
    </div>

    <div
      class="xl:max-h-screen-offset order-3 flex flex-col gap-y-10 md:order-2 md:pt-4 xl:h-full xl:items-end xl:justify-between xl:pb-8 2xl:pb-12"
    >
      <BannerHero class="relative z-20 w-full max-w-md" />

      <div
        class="xs:max-w-[22rem] bg-halftone relative isolate z-10 mx-auto aspect-4/5 w-full rounded-tl-4xl border-2 border-black bg-sky-500 text-black [corner-shape:bevel] after:[corner-shape:bevel] xl:mr-0 xl:ml-auto"
      >
        <div
          class="relative z-20 flex h-full flex-col items-center justify-center px-7 py-10 text-center md:items-end md:text-right"
        >
          <div
            class="rounded-tl-lg border-2 border-black bg-[#EDDEC1] px-3 py-2 text-base font-medium tracking-tight text-black [corner-shape:bevel]"
          >
            {{
              $t("hero.edition", {
                n: event.edition.value,
                ordinal: event.edition.ordinal,
              })
            }}
          </div>

          <div
            class="font-display text-outline mt-3 flex flex-col items-center text-center text-[5.5rem] leading-[0.9]! tracking-tighter text-balance text-yellow-400 uppercase [--text-drop-shadow:-4px_6px_0px_#000000] [--text-outline-size:2px] [--text-shadow-color:var(--color-black)] md:items-end md:text-right"
          >
            <span>{{ event.dateOnly }}</span>
            <span>{{ event.month }}</span>
            <span>{{ event.year }}</span>
          </div>
          <span
            class="text-outline mt-6 text-3xl font-semibold tracking-tight text-white [--text-outline-size:2px] [--text-shadow-color:var(--color-black)]"
            >{{ event.locationShort }}</span
          >
          <span class="mt-1 line-clamp-1 text-sm tracking-tight">{{
            event.hall
          }}</span>
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
