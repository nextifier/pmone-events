<template>
  <section id="hero" ref="containerRef" class="relative isolate">
    <div class="min-h-screen-offset grid grid-cols-1">
      <div
        class="container-wider relative isolate grid grow grid-cols-1 gap-y-6 pt-6 md:grid-cols-2 md:items-end md:pt-0 xl:grid-cols-3"
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

          <div class="flex flex-col items-start gap-y-4 xl:translate-y-[30%]">
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
          <!-- <NuxtImg
            src="/img/kv/futuristic-humanoid-robot 1000px.png"
            alt=""
            width="1000"
            height="1029"
            sizes="400px sm:1000px"
            class="h-auto w-full translate-x-[5%]"
            format="webp"
          /> -->
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

              <Button to="/ticket" size="lg" class="text-lg">Register</Button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-16 px-2 sm:mt-0">
        <div class="origin-bottom -skew-y-10">
          <div
            class="container-wider text-foreground mb-3 text-3xl font-semibold tracking-tighter sm:text-4xl"
          >
            {{ event.date }}
          </div>
          <div
            class="relative isolate min-h-[400px] w-full rounded-2xl [clip-path:inset(-100vh_0_0_0)]"
          >
            <NuxtImg
              src="/img/kv/futuristic-humanoid-robot 1000px.png"
              alt=""
              width="1000"
              height="1029"
              sizes="400px sm:1000px"
              class="absolute bottom-0 left-1/2 z-10 h-auto w-full max-w-[400px] translate-x-[-45%] scale-120 skew-y-10 sm:max-w-[40%]"
              format="webp"
            />

            <div
              id="animate-this"
              class="bg-primary absolute inset-0 z-0 overflow-hidden rounded-2xl transition-[clip-path] delay-[600ms] duration-[1600ms] ease-[cubic-bezier(0.65,0,0.35,1)] [clip-path:inset(0_0_0_0)] starting:[clip-path:inset(0_100%_0_0)]"
            >
              <img
                src="/img/kv/holographic-waves.jpg"
                class="size-full object-cover"
              />
            </div>
          </div>
          <div
            class="container-wider text-foreground mt-3 text-right text-3xl font-semibold tracking-tighter sm:text-4xl"
          >
            {{ event.location }}
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
