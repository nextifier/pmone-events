<template>
  <section id="hero" class="relative isolate overflow-hidden">
    <div
      class="container-wider xl:min-h-screen-offset relative isolate z-10 flex flex-col justify-center py-6 md:py-10"
    >
      <div
        class="grid grid-cols-2 gap-y-10 md:grid-cols-2 md:items-end xl:grid-cols-12"
      >
        <div
          class="order-1 col-span-2 flex flex-col items-start md:order-1 md:col-span-1 xl:order-1 xl:col-span-4"
        >
          <EventStatus
            countdownVariant="inline-with-boxes"
            :withTextPrefix="true"
            :prefix="$t('hero.countdown')"
            class="h-8 sm:h-9 md:hidden"
            :startTime="eventStartTime"
            :endTime="eventEndTime"
          />

          <div v-if="event.edition" class="mt-4 flex">
            <span
              class="text-foreground text-base font-medium tracking-tight sm:text-lg"
              >{{ $t("hero.edition") }}</span
            >
          </div>

          <h1
            class="section-title mt-1 flex w-full flex-col items-start leading-none!"
          >
            <SplitText3D
              tag="span"
              origin="left"
              class="text-foreground"
              :text="$t('hero.headline1')"
            />
            <SplitText3D
              tag="span"
              origin="left"
              class="headline-gradient pb-2 font-normal"
              :text="$t('hero.headline2')"
            />
          </h1>

          <p class="section-description mt-2 max-w-xl">
            {{ $t("hero.description") }}
          </p>

          <div class="mt-5 flex flex-wrap gap-2 md:gap-3">
            <Button
              size="lg"
              class="bg-accent text-accent-foreground hover:bg-accent/80"
              @click="handleBuyTicket"
            >
              {{ $t("tickets.buyNow") }}
            </Button>
            <Button
              v-if="hotelVisible"
              :to="localePath('/hotels')"
              variant="secondary"
              size="lg"
            >
              {{ $t("hotels.bookNow") }}
            </Button>
          </div>
        </div>

        <div class="order-2 md:order-3 md:col-span-2 xl:order-2 xl:col-span-4">
          <NuxtImg
            src="/img/iicc-yogyakarta.png"
            alt="IICC Yogyakarta"
            class="pointer-events-none mx-auto size-full max-w-xl shrink-0 scale-120 object-contain select-none md:scale-100 xl:scale-110"
            size="400px md:800px"
            width="800"
            height="1057"
            format="webp"
          />
        </div>

        <div
          class="order-3 flex flex-col items-end justify-between gap-y-10 text-right md:order-2 md:col-span-1 xl:order-3 xl:col-span-4 xl:h-full"
        >
          <div
            class="to-kv-brown-100 dark:to-kv-brown-950 hidden aspect-square items-center justify-center rounded-full bg-radial-[at_25%_25%] from-white to-75% xl:flex xl:w-64 dark:from-gray-800"
          >
            <span
              class="text-accent text-center text-3xl leading-none! tracking-tighter text-balance xl:text-5xl"
              >{{ $t("hero.tagline") }}</span
            >
          </div>

          <div
            class="text-primary relative z-20 flex w-full flex-col items-end text-right"
          >
            <EventStatus
              countdownVariant="inline-with-boxes"
              :withTextPrefix="true"
              :prefix="$t('hero.countdown')"
              class="hidden h-8 sm:h-9 md:flex"
              :startTime="eventStartTime"
              :endTime="eventEndTime"
            />

            <span
              class="relative isolate mt-2 flex flex-col items-end text-5xl leading-none! font-medium tracking-tighter text-balance sm:text-6xl xl:text-7xl"
            >
              <span>{{ event.month }}</span>
              <span>{{ event.dateOnly }},</span>
              <span class="text-accent/40">{{ event.year }}</span>
            </span>
            <nuxt-link
              :to="event.locationLink ?? ''"
              target="_blank"
              class="mt-2.5 text-xl font-semibold tracking-tighter text-balance decoration-dotted underline-offset-4 hover:underline"
              >{{ event.location }}</nuxt-link
            >
            <span
              v-if="event.hall"
              class="mt-2 line-clamp-1 text-sm tracking-tight"
              >{{ event.hall }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { toast } from "vue-sonner";
import { gsap } from "gsap";

const appConfig = useAppConfig();
const event = appConfig.event;
const eventStartTime = computed(() => new Date(event.startTime));
const eventEndTime = computed(() => new Date(event.endTime));
const { t } = useI18n();
const localePath = useLocalePath();
const { visible: hotelVisible } = useHotelSectionVisibility();

// Image animation refs
const imageContainerRef = ref(null);
const imageLeftRef = ref(null);
const imageCenterRef = ref(null);
const imageRightRef = ref(null);
const imagesReady = ref(false);

const initImageAnimation = () => {
  const container = imageContainerRef.value;
  if (!container) return;

  const leftImg = container.querySelector(".hero-image-left");
  const centerImg = container.querySelector(".hero-image-center");
  const rightImg = container.querySelector(".hero-image-right");

  if (!leftImg || !centerImg || !rightImg) return;

  // Set initial state - all stacked in center, ready to appear
  gsap.set(leftImg, {
    scale: 0.5,
    rotation: 0,
    xPercent: 100, // Stacked in center
    yPercent: 0,
    autoAlpha: 0,
    transformOrigin: "center center",
  });

  gsap.set(centerImg, {
    scale: 0.5,
    rotation: 0,
    xPercent: 0,
    yPercent: 0,
    autoAlpha: 0,
    transformOrigin: "center center",
  });

  gsap.set(rightImg, {
    scale: 0.5,
    rotation: 0,
    xPercent: -100, // Stacked in center
    yPercent: 0,
    autoAlpha: 0,
    transformOrigin: "center center",
  });

  // Show container
  imagesReady.value = true;

  // Create timeline with initial delay
  const tl = gsap.timeline({
    delay: 0.2,
    defaults: {
      ease: "power1.out",
      duration: 0.8,
    },
  });

  // Phase 1: Fade in only (no movement, no scale change)
  tl.to(
    [centerImg, leftImg, rightImg],
    {
      autoAlpha: 1,
      duration: 0.8,
      stagger: 0.08,
    },
    0,
  );

  // Phase 2: Fan out to final positions
  tl.to(
    leftImg,
    {
      xPercent: 0,
      yPercent: 10,
      rotation: -6,
      scale: 1,
      duration: 0.7,
      ease: "back.out(1.2)",
    },
    "-=0.1",
  );

  tl.to(
    centerImg,
    {
      scale: 1.1,
      duration: 0.7,
      ease: "back.out(1.2)",
    },
    "<",
  );

  tl.to(
    rightImg,
    {
      xPercent: 0,
      yPercent: 10,
      rotation: 6,
      scale: 1,
      duration: 0.7,
      ease: "back.out(1.2)",
    },
    "<",
  );
};

// Wait for image to load
const waitForImageLoad = (img) => {
  return new Promise((resolve) => {
    if (img.complete && img.naturalHeight !== 0) {
      resolve();
    } else {
      img.addEventListener("load", () => resolve(), { once: true });
      img.addEventListener("error", () => resolve(), { once: true });
    }
  });
};

onMounted(async () => {
  await nextTick();

  const container = imageContainerRef.value;
  if (!container) return;

  // Get all hero images
  const images = container.querySelectorAll(".hero-image img");

  // Wait for all images to load
  if (images.length > 0) {
    await Promise.all(Array.from(images).map(waitForImageLoad));
  }

  initImageAnimation();
});

const handleBuyTicket = () => {
  if (appConfig.ticket.status !== "available") {
    toast.info(t("tickets.notAvailable"));
    return;
  }

  const url = appConfig.routes.visitorRegistration.path;
  if (url.startsWith("http")) {
    window.open(url, "_blank");
  } else {
    navigateTo(localePath(url));
  }
};
</script>

<style scoped>
.headline-gradient :deep(.split-line) {
  background-image:
    linear-gradient(0deg, var(--color-accent), var(--color-accent)),
    linear-gradient(to right, rgba(255, 255, 255, 0) 52.79%, #ffffff 95.95%),
    linear-gradient(
      76.82deg,
      #576265 11.6%,
      #9ea1a1 25.31%,
      #848b8a 48.06%,
      #576265 55.72%,
      #576265 77.23%,
      #757a7b 85.34%,
      #576265 91.31%
    );
  background-blend-mode: color, overlay, normal;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-image {
  transition:
    transform 0.3s ease-out,
    z-index 0s;
}
</style>
