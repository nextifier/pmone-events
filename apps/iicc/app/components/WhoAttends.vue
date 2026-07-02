<template>
  <section id="who-attends">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span
          class="border-foreground rounded-full border px-3 py-1.5 text-base font-medium tracking-tighter sm:text-lg"
          >{{ $t("audience.badge") }}</span
        >
        <h2 class="section-title mt-2">
          {{ $t("audience.title") }}
          <span class="text-gradient-accent">{{
            $t("audience.titleAccent")
          }}</span>
        </h2>

        <p class="section-description mt-3 w-full">
          {{ $t("audience.description") }}
        </p>
      </div>

      <div
        class="mt-8 grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-x-4 gap-y-4"
      >
        <div
          v-for="audience in audiences"
          :key="audience.title"
          class="border-border/50 bg-muted/30 relative flex flex-col items-start rounded-2xl border px-4 py-6 sm:px-6"
        >
          <div
            class="bg-muted text-accent flex size-12 items-center justify-center rounded-xl"
          >
            <Icon :name="audience.icon" class="size-5" />
          </div>

          <h3 class="text-foreground mt-4 text-xl font-medium tracking-tight">
            {{ audience.title }}
          </h3>

          <p class="mt-2 tracking-tight">
            {{ audience.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- <GalleryCarouselAutoScroll :gallery="gallery" class="mt-16 lg:mt-24" /> -->
  </section>
</template>

<script setup>
const { t } = useI18n();

const audiences = computed(() => [
  {
    icon: "hugeicons:plant-01",
    title: t("audience.items.farmers.title"),
    description: t("audience.items.farmers.description"),
  },
  {
    icon: "hugeicons:exchange-01",
    title: t("audience.items.traders.title"),
    description: t("audience.items.traders.description"),
  },
  {
    icon: "hugeicons:factory-02",
    title: t("audience.items.manufacturers.title"),
    description: t("audience.items.manufacturers.description"),
  },
  {
    icon: "hugeicons:ice-cream-02",
    title: t("audience.items.chocolateMakers.title"),
    description: t("audience.items.chocolateMakers.description"),
  },
  {
    icon: "hugeicons:money-bag-01",
    title: t("audience.items.financial.title"),
    description: t("audience.items.financial.description"),
  },
  {
    icon: "hugeicons:truck-delivery",
    title: t("audience.items.serviceProviders.title"),
    description: t("audience.items.serviceProviders.description"),
  },
  {
    icon: "hugeicons:building-03",
    title: t("audience.items.policymakers.title"),
    description: t("audience.items.policymakers.description"),
  },
  {
    icon: "hugeicons:test-tube-01",
    title: t("audience.items.researchers.title"),
    description: t("audience.items.researchers.description"),
  },
]);

const gallery = [
  {
    src: "/img/cocoa/cocoa-1.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/cocoa/cocoa-2.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/cocoa/cocoa-3.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/cocoa/cocoa-4.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/cocoa/cocoa-5.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
  {
    src: "/img/cocoa/cocoa-6.jpg",
    w: 1080,
    h: 720,
    alt: "",
  },
];
</script>
