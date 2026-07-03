<template>
  <div class="space-y-16 overflow-hidden lg:space-y-24">
    <div class="container flex flex-col lg:items-center lg:text-center">
      <h2 class="section-title-large">
        <SplitText
          splitType="words"
          ease="expo.out"
          :delay="150"
          :duration="2"
          :text="`
              <span class='text-accent'>${$t('about.sectionTitle')}</span>
            `"
        />
      </h2>

      <div
        class="text-foreground mx-auto max-w-4xl space-y-4 text-2xl !leading-[1.3] font-semibold tracking-tighter text-balance sm:text-3xl"
      >
        <p>
          {{ $t("about.sectionDescription") }}
        </p>
      </div>

      <div
        class="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:mt-10 lg:grid-cols-4"
      >
        <MainProgramCard
          v-for="zone in zones"
          :key="zone.iconName"
          :program="zone"
        />
      </div>
    </div>

    <MainPrograms />
  </div>
</template>

<script setup>
const { t } = useI18n();

const zones = computed(() => [
  {
    iconName: "hugeicons:coffee-02",
    title: t("about.eventZones.coffeeBrew.title"),
    description: t("about.eventZones.coffeeBrew.description"),
  },
  {
    iconName: "hugeicons:croissant",
    title: t("about.eventZones.chocolatePastry.title"),
    description: t("about.eventZones.chocolatePastry.description"),
  },
  {
    iconName: "hugeicons:drink",
    title: t("about.eventZones.wineSpirits.title"),
    description: t("about.eventZones.wineSpirits.description"),
  },
  {
    iconName: "hugeicons:chef",
    title: t("about.eventZones.culinaryHub.title"),
    description: t("about.eventZones.culinaryHub.description"),
  },
  {
    iconName: "hugeicons:factory-01",
    title: t("about.eventZones.equipment.title"),
    description: t("about.eventZones.equipment.description"),
  },
  {
    iconName: "hugeicons:store-01",
    title: t("about.eventZones.supplierMarket.title"),
    description: t("about.eventZones.supplierMarket.description"),
  },
  {
    iconName: "hugeicons:mic-01",
    title: t("about.eventZones.mainStage.title"),
    description: t("about.eventZones.mainStage.description"),
  },
  {
    iconName: "hugeicons:leaf-01",
    title: t("about.eventZones.sustainability.title"),
    description: t("about.eventZones.sustainability.description"),
  },
]);
</script>
