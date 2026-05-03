<template>
  <section id="hero" ref="containerRef" class="relative isolate">
    <div class="container-wider relative z-20">
      <div
        class="min-h-screen-offset relative isolate grid grid-cols-1 gap-y-6 pt-6 md:grid-cols-2 md:items-end md:pt-0 xl:grid-cols-3"
      >
        <div
          class="relative z-20 order-first flex h-full flex-col justify-between gap-y-6 sm:gap-y-12 md:pt-6 lg:pb-10 2xl:pt-10 2xl:pb-16"
        >
          <div class="flex flex-col items-start gap-y-2.5">
            <span class="text-foreground text-base tracking-tight">
              <!-- {{ content.countdownLabel }} -->
              Asia's AI floor opens in
            </span>

            <EventStatus
              countdownVariant="inline-with-boxes"
              :withTextPrefix="false"
              class="h-8 sm:h-9"
              :startTime="eventStartTime"
              :endTime="eventEndTime"
            />
          </div>

          <div class="flex flex-col items-start gap-y-4">
            <AvatarGroup
              :items="brands"
              :size="3"
              :show-tooltip="true"
              :colorful="false"
              label="Featured AI brands"
            />
            <h1
              class="text-foreground text-3xl font-normal tracking-[-0.06em] text-balance sm:text-5xl xl:text-6xl"
            >
              Meet the builders shipping applied AI across Asia.
            </h1>
          </div>
        </div>

        <div
          class="relative isolate z-10 order-2 flex h-full origin-bottom flex-col items-center justify-end md:order-last md:col-span-2 xl:order-2 xl:col-span-1 xl:scale-140"
        >
          <NuxtImg
            src="/img/kv/futuristic-humanoid-robot 1000px.png"
            alt=""
            width="1000"
            height="1029"
            sizes="400px sm:1000px"
            class="h-auto w-full translate-x-[5%]"
            format="webp"
          />
        </div>

        <div
          class="relative z-30 order-3 h-full md:order-2 md:pt-6 lg:pb-10 xl:order-last 2xl:pt-10 2xl:pb-16"
        >
          <div
            class="relative ml-auto flex size-full flex-col justify-between gap-y-6"
          >
            <div class="flex flex-col items-end gap-y-3">
              <div
                class="text-foreground text-right text-2xl font-semibold tracking-tighter text-balance"
              >
                200+ companies demoing AI products already in production, across
                eight industry zones.
              </div>

              <Button size="lg">Register</Button>
            </div>
            <!-- <div
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
            </div> -->
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

const brands = [
  { name: "Claude", profile_image: { sm: "/img/brands/claudeai.jpg" } },
  { name: "Gemini", profile_image: { sm: "/img/brands/googlegemini.jpg" } },
  { name: "ChatGPT", profile_image: { sm: "/img/brands/chatgpt.jpg" } },
  {
    name: "DeepSeek",
    profile_image: { sm: "/img/brands/deepseekai_official.jpg" },
  },
];
</script>
