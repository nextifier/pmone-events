<template>
  <section id="theme-concept">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="section-subtitle mb-3 uppercase">{{
          $t("themeConcept.subtitle")
        }}</span>
        <h2 class="section-title max-w-4xl">
          {{ $t("themeConcept.title") }}
        </h2>

        <p
          class="text-foreground/80 mx-auto mt-3 max-w-3xl text-center text-base tracking-tight text-balance sm:text-lg"
        >
          {{ $t("themeConcept.description") }}
        </p>
      </div>

      <div
        class="mt-8 grid grid-cols-1 gap-4 text-left md:grid-cols-3 lg:mt-10"
      >
        <MainProgramCard
          v-for="pillar in pillars"
          :key="pillar.iconName"
          :program="pillar"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();

const pillars = computed(() => [
  {
    iconName: "hugeicons:dish-01",
    title: t("themeConcept.pillars.tasteCircle.title"),
    description: t("themeConcept.pillars.tasteCircle.description"),
  },
  {
    iconName: "hugeicons:user-group",
    title: t("themeConcept.pillars.networking.title"),
    description: t("themeConcept.pillars.networking.description"),
  },
  {
    iconName: "hugeicons:location-01",
    title: t("themeConcept.pillars.experientialZones.title"),
    description: t("themeConcept.pillars.experientialZones.description"),
  },
]);
</script>
