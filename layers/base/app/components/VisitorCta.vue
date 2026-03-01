<template>
  <section id="visitor-cta">
    <div class="container">
      <div
        class="flex flex-col gap-x-6 gap-y-16 lg:flex-row lg:items-start lg:justify-between xl:gap-x-8"
      >
        <div
          class="grid grow grid-cols-1 items-center gap-x-8 gap-y-4 lg:items-start"
          :class="{
            'lg:grid-cols-2 lg:!items-end': content.banners?.length === 0,
          }"
        >
          <div
            class="relative isolate w-full [clip-path:inset(-100%_0_0_-100%)]"
            :class="
              content.img.src.endsWith('.png')
                ? ''
                : 'aspect-square sm:aspect-auto'
            "
          >
            <NuxtImg
              :src="content.img.src"
              alt=""
              class="pointer-events-none relative z-10 size-full rounded-3xl select-none"
              :class="
                content.img.src.endsWith('.png')
                  ? 'origin-bottom-right scale-110 object-contain'
                  : 'object-cover'
              "
              sizes="100vw lg:1600px"
              :width="content.img.width"
              :height="content.img.height"
              loading="lazy"
              format="webp"
            />
            <div
              class="border-primary/5 dark:border-primary/10 bg-pattern-diagonal absolute inset-x-0 bottom-0 z-0 rounded-3xl border [--pattern-fg:var(--color-primary)]/5 dark:[--pattern-fg:var(--color-primary)]/10"
              :class="content.img.src.endsWith('.png') ? 'h-[90%]' : 'h-full'"
            ></div>

            <div
              ref="ctaCardContainer"
              class="xs:p-4 absolute inset-x-0 bottom-0 z-30 flex sm:justify-end"
            >
              <div
                ref="ctaCard"
                class="bg-pattern-diagonal text-primary flex origin-bottom-right flex-col items-start rounded-3xl border border-gray-200/50 bg-white/60 p-6 text-right backdrop-blur-xl sm:items-end sm:p-10 dark:border-white/10 dark:bg-black/60"
                :class="isInitialized ? 'visible' : 'invisible'"
              >
                <div
                  class="relative isolate flex items-end gap-x-2 text-right text-2xl !leading-[0.9] font-semibold tracking-tighter text-balance uppercase sm:flex-col sm:text-7xl"
                >
                  <span>{{ event.dateOnly }}</span>
                  <span
                    class="gradient-accent bg-linear-to-r bg-clip-text text-transparent"
                    >{{ event.month }}</span
                  >
                  <span>{{ event.year }}</span>
                </div>

                <div
                  class="mt-2 flex w-full flex-col items-baseline gap-x-2 gap-y-1 text-left sm:mt-4 sm:items-end sm:gap-y-2 sm:text-right"
                >
                  <nuxt-link
                    :to="event.locationLink ?? ''"
                    target="_blank"
                    class="shrink-0 text-base font-semibold tracking-tighter text-balance decoration-dotted underline-offset-4 hover:underline"
                    >{{ event.locationShort }}
                  </nuxt-link>
                  <span
                    v-if="event.hall"
                    class="line-clamp-1 text-sm tracking-tight"
                    >{{ event.hall }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-start text-left">
            <!-- <SplitText3D
              tag="h2"
              origin="left"
              class="text-primary section-title-large relative isolate font-semibold tracking-tighter text-balance"
              :text="content.title"
            /> -->
            <h2
              class="text-primary section-title-large relative isolate font-semibold tracking-tighter text-balance"
              v-html="content.title"
            />
            <p
              class="text-primary/80 mt-4 max-w-2xl text-base tracking-tight text-pretty sm:text-lg"
            >
              {{ content.description }}
            </p>

            <div class="xs:w-auto mt-6 flex w-full items-center gap-2">
              <NuxtLink
                :to="content.cta.url"
                :target="content.cta.url.startsWith('http') ? '_blank' : ''"
                class="bg-primary text-primary-foreground hover:bg-primary/80 xs:grow-0 rainbow-button flex grow items-center justify-center gap-x-1.5 rounded-xl px-5 py-4 font-semibold tracking-tight transition active:scale-95"
              >
                <Icon
                  v-if="content.cta.iconName"
                  :name="content.cta.iconName"
                  class="size-4.5 shrink-0"
                />
                <span>{{ content.cta.label }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <div
          v-if="content.banners?.length"
          class="grid shrink-0 grid-cols-1 gap-y-8"
          :class="content.img.src.endsWith('.png') ? 'lg:mt-[10%]' : ''"
        >
          <div
            v-for="(banner, index) in content.banners"
            :key="index"
            class="flex items-start gap-x-2.5 gap-y-4 lg:max-w-[240px] lg:flex-col"
          >
            <nuxt-link
              :to="banner.cta.link"
              :target="banner.cta.link.startsWith('http') ? '_blank' : ''"
              class="lg:shadow-wrapper aspect-4/5 min-w-24 rounded-xl transition duration-500 sm:rounded-2xl lg:w-full lg:hover:rotate-6"
            >
              <NuxtImg
                v-if="banner.image"
                :src="banner.image"
                :alt="banner.title"
                class="bg-muted border-border size-full rounded-lg border object-cover select-none sm:rounded-xl lg:shadow-md"
                sizes="240px"
                width="1080"
                height="1350"
                loading="lazy"
                format="webp"
              />
            </nuxt-link>

            <div class="flex flex-col items-start gap-y-1.5">
              <span
                v-if="banner.subtitle"
                class="text-sm font-semibold tracking-tighter text-[var(--accent-color-light)] dark:text-[var(--accent-color-dark)]"
                :style="{
                  '--accent-color-light': banner.accentColor.light,
                  '--accent-color-dark': banner.accentColor.dark,
                }"
              >
                {{ banner.subtitle }}
              </span>

              <h6
                v-if="banner.title"
                class="text-primary text-base !leading-[1.3] font-semibold tracking-tighter text-balance sm:text-lg"
              >
                {{ banner.title }}
              </h6>

              <p v-if="banner.description" class="text-sm tracking-tight">
                {{ banner.description }}
              </p>

              <nuxt-link
                v-if="banner.cta"
                :to="banner.cta.link"
                :target="banner.cta.link.startsWith('http') ? '_blank' : ''"
                class="bg-border/60 text-primary hover:bg-border/80 mt-1 flex items-center justify-center gap-x-1 rounded-lg py-2 pr-2 pl-3 text-sm font-semibold tracking-tight transition active:scale-95"
                v-ripple
              >
                <span class="line-clamp-1">{{ banner.cta.label }}</span>
                <Icon name="lucide:arrow-up-right" class="size-4 shrink-0" />
              </nuxt-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const content = computed(() => useContentStore().components.visitorCta);
const event = useAppConfig().event;

const isInitialized = ref(false);
const ctaCard = ref(null);
const ctaCardContainer = ref(null);

let ctx;

const initializeAnimation = async () => {
  if (typeof window === "undefined") return;

  await nextTick();

  gsap.registerPlugin(ScrollTrigger);

  ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ctaCardContainer.value,
        start: "bottom 100%",
        end: "bottom 60%",
        scrub: 1,
        ease: "none",
        // markers: true,
      },
      //   delay: 0.3,
    });

    tl.from(ctaCard.value, {
      yPercent: 100,
      ease: "none",
    });

    isInitialized.value = true;
  }, ctaCardContainer.value);
};

onMounted(() => {
  initializeAnimation();
});

onUnmounted(() => {
  if (ctx) {
    ctx.revert();
  }
});
</script>
