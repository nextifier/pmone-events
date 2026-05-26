<template>
  <section id="why-yogyakarta">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span
          class="border-primary rounded-full border px-3 py-1.5 text-base font-medium tracking-tighter sm:text-lg"
          >{{ $t("whyYogyakarta.badge") }}</span
        >
        <h2 class="section-title mt-2">
          {{ $t("whyYogyakarta.title") }}
          <span class="text-gradient-accent">{{
            $t("whyYogyakarta.titleAccent")
          }}</span>
        </h2>

        <p class="section-description mt-3 w-full">
          {{ $t("whyYogyakarta.description") }}
        </p>
      </div>

      <div
        class="mt-10 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-4 gap-y-4"
      >
        <div
          v-for="reason in reasons"
          :key="reason.title"
          class="border-border/50 bg-muted/30 relative flex flex-col items-start rounded-2xl border px-4 py-6 sm:px-6"
        >
          <div
            class="bg-muted text-accent flex size-12 items-center justify-center rounded-xl"
          >
            <Icon :name="reason.icon" class="size-5" />
          </div>

          <h3 class="text-foreground mt-4 text-xl font-medium tracking-tight">
            {{ reason.title }}
          </h3>

          <p class="mt-2 tracking-tight">
            {{ reason.description }}
          </p>
        </div>
      </div>

      <div class="mt-20 flex flex-col items-center text-center lg:mt-24">
        <h3 class="section-title">
          {{ $t("whyYogyakarta.experiences.heading") }}
          <span class="text-gradient-accent">{{
            $t("whyYogyakarta.experiences.headingAccent")
          }}</span>
        </h3>
        <p class="section-description mt-3 w-full">
          {{ $t("whyYogyakarta.experiences.description") }}
        </p>
      </div>

      <div
        class="mt-10 grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
      >
        <article
          v-for="experience in experiences"
          :key="experience.key"
          class="group flex flex-col"
        >
          <div class="bg-muted relative aspect-4/5 overflow-hidden rounded-2xl">
            <NuxtImg
              :src="experience.src"
              :alt="experience.alt"
              width="1280"
              height="1600"
              loading="lazy"
              format="webp"
              sizes="50vw sm:33vw lg:20vw"
              class="size-full object-cover transition duration-700 group-hover:scale-105"
            />
          </div>

          <div class="mt-4 flex flex-col gap-y-1 px-1">
            <h3
              class="text-foreground text-xl font-medium tracking-tighter text-balance sm:text-xl"
            >
              {{ experience.title }}
            </h3>

            <p class="text-base tracking-tight text-pretty">
              {{ experience.description }}
            </p>
          </div>
        </article>
      </div>

      <div class="mt-20 flex flex-col items-center text-center lg:mt-24">
        <h3 class="section-title">
          {{ $t("whyYogyakarta.cta.heading") }}
          <span class="text-gradient-accent">{{
            $t("whyYogyakarta.cta.headingAccent")
          }}</span>
        </h3>
        <p class="section-description mt-3 w-full">
          {{ $t("whyYogyakarta.cta.description") }}
        </p>
      </div>

      <div
        class="mt-10 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2 md:grid-rows-[auto_auto_1fr_auto] md:gap-y-0"
      >
        <div
          class="border-border/50 bg-muted/30 relative grid rounded-2xl border p-6 sm:p-8 md:row-span-4 md:grid-rows-subgrid"
        >
          <div
            class="bg-accent/10 text-accent flex size-12 items-center justify-center rounded-xl"
          >
            <Icon name="hugeicons:hotel-01" class="size-5" />
          </div>
          <h4
            class="text-foreground mt-6 text-2xl leading-tight font-medium tracking-tighter"
          >
            {{ $t("whyYogyakarta.cta.hotels.title") }}
          </h4>
          <p class="mt-2 text-base tracking-tight text-pretty sm:text-lg">
            {{ $t("whyYogyakarta.cta.hotels.description") }}
          </p>
          <Button
            :to="localePath('/hotels')"
            size="lg"
            class="group bg-accent text-accent-foreground hover:bg-accent/80 mt-6 w-fit justify-self-start"
          >
            {{ $t("whyYogyakarta.cta.hotels.cta") }}
            <Icon
              name="hugeicons:arrow-right-02"
              class="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Button>
        </div>

        <div
          class="border-border/50 bg-muted/30 relative grid rounded-2xl border p-6 sm:p-8 md:row-span-4 md:grid-rows-subgrid"
        >
          <div
            class="bg-accent/10 text-accent flex size-12 items-center justify-center rounded-xl"
          >
            <Icon name="hugeicons:route-01" class="size-5" />
          </div>
          <h4
            class="text-foreground mt-6 text-2xl leading-tight font-medium tracking-tighter"
          >
            {{ $t("whyYogyakarta.cta.itinerary.title") }}
          </h4>
          <p class="mt-2 text-base tracking-tight text-pretty sm:text-lg">
            {{ $t("whyYogyakarta.cta.itinerary.description") }}
          </p>
          <Button
            as="a"
            :href="itineraryMailto"
            size="lg"
            class="group bg-accent text-accent-foreground hover:bg-accent/80 mt-6 w-fit justify-self-start"
          >
            {{ $t("whyYogyakarta.cta.itinerary.cta") }}
            <Icon
              name="hugeicons:arrow-right-02"
              class="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();
const localePath = useLocalePath();

const reasonKeys = ["heritage", "cocoaCountry", "access", "hospitality"];
const experienceKeys = [
  "borobudur",
  "prambanan",
  "kraton",
  "malioboro",
  "chocolate",
  "merapi",
];

const reasons = computed(() =>
  reasonKeys.map((key) => ({
    icon: t(`whyYogyakarta.reasons.${key}.icon`),
    title: t(`whyYogyakarta.reasons.${key}.title`),
    description: t(`whyYogyakarta.reasons.${key}.description`),
  })),
);

const experiences = computed(() =>
  experienceKeys.map((key) => ({
    key,
    src: `/img/yogyakarta/${key}.jpg`,
    alt: t(`whyYogyakarta.experiences.items.${key}.alt`),
    title: t(`whyYogyakarta.experiences.items.${key}.title`),
    meta: t(`whyYogyakarta.experiences.items.${key}.meta`),
    description: t(`whyYogyakarta.experiences.items.${key}.description`),
  })),
);

const itineraryMailto = `mailto:events@panoramamedia.co.id?subject=${encodeURIComponent("9th IICC: Custom Itinerary & Transport Inquiry")}`;
</script>
