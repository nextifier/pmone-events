<template>
  <section id="hero" ref="containerRef" class="relative isolate">
    <div class="min-h-screen-offset grid grid-cols-1">
      <div
        class="container-wider relative isolate grid grow grid-cols-1 gap-y-6 pt-6 md:grid-cols-2 md:items-start md:pt-0 xl:grid-cols-3 xl:-space-y-[20%]"
      >
        <div
          class="relative z-20 order-first flex flex-col justify-between gap-y-6 sm:gap-y-12 md:pt-6 lg:pb-10 2xl:pt-10 2xl:pb-16"
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
              class="text-foreground text-[8.5vw] leading-[1.15]! font-normal tracking-[-0.06em] text-balance sm:text-5xl xl:text-6xl"
            >
              Meet the builders shipping applied AI across Asia.
            </h1>
          </div>
        </div>

        <div class="order-2 md:col-span-2 xl:order-2 xl:col-span-1"></div>

        <div
          class="relative z-30 order-3 h-auto md:order-2 md:pt-6 lg:pb-10 xl:order-last 2xl:pt-10 2xl:pb-16"
        >
          <div
            class="relative ml-auto flex size-full flex-col justify-between gap-y-6"
          >
            <div class="flex flex-col items-end gap-y-3">
              <div
                class="text-foreground text-right text-2xl font-medium tracking-tighter text-balance"
              >
                200+ companies demoing AI products already in production, across
                eight industry zones.
              </div>

              <Button to="/tickets" size="lg" class="text-lg">Register</Button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-16 px-1 sm:mt-0 sm:px-2">
        <div class="origin-bottom -skew-y-10">
          <div
            class="container-wider text-foreground mb-3 text-3xl font-semibold tracking-tighter sm:text-4xl"
          >
            {{ event.date }}
          </div>
          <div
            class="relative isolate min-h-[400px] w-full rounded-3xl [clip-path:inset(-100vh_-100vw_0_-100vw)] sm:rounded-4xl"
          >
            <NuxtImg
              src="/img/kv/humanoid-robots.png"
              alt=""
              width="1000"
              height="877"
              sizes="400px sm:1000px"
              class="pointer-events-none absolute bottom-0 left-1/2 z-10 h-auto w-full max-w-[400px] translate-x-[-45%] scale-135 skew-y-10 select-none sm:max-w-[40%] 2xl:translate-y-[3%] 2xl:scale-120"
              format="webp"
            />

            <div
              :class="[
                'bg-primary absolute inset-0 z-0 overflow-hidden rounded-3xl transition-[clip-path] delay-[500ms] duration-[2000ms] ease-in-out sm:rounded-4xl',
                shaderReady
                  ? '[clip-path:inset(0_0_0_0)]'
                  : '[clip-path:inset(0_100%_0_0)]',
              ]"
            >
              <Shader class="size-full" @ready="shaderReady = true">
                <Swirl
                  :blend="59"
                  color-a="#00fff7"
                  color-b="#0066ff"
                  color-space="oklch"
                  :detail="4.1"
                />
                <Blob
                  :center="{
                    x: 0.85,
                    y: 0.55,
                  }"
                  color-a="#ff35c2"
                  color-b="#ffaa00"
                  color-space="oklch"
                  :deformation="1"
                  :highlight-intensity="0.8"
                  :highlight-z="0.8"
                  :size="0.54"
                  :softness="1"
                  :visible="true"
                />
                <WaveDistortion
                  :angle="127"
                  edges="mirror"
                  :frequency="30"
                  :speed="4.9"
                  :strength="0.7"
                  :visible="true"
                  wave-type="triangle"
                />
                <ChromaticAberration :strength="0.02" :visible="true" />
                <FilmGrain :strength="0.15" :visible="true" />
                <Liquify />
              </Shader>
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
import {
  Shader,
  Blob,
  ChromaticAberration,
  FilmGrain,
  Liquify,
  Swirl,
  WaveDistortion,
} from "shaders/vue";

const localePath = useLocalePath();
const content = computed(() => useContentStore().components.hero);
const shaderReady = ref(false);
const event = useEvent();
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
