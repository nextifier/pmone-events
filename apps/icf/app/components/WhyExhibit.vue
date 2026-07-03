<template>
  <section id="why-exhibit">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="section-subtitle mb-3 uppercase">{{
          $t("whyExhibit.subtitle")
        }}</span>
        <h2 class="section-title">
          {{ $t("whyExhibit.title") }}
        </h2>

        <p
          class="text-foreground/80 mx-auto mt-3 max-w-3xl text-center text-base tracking-tight text-balance sm:text-lg"
        >
          {{ $t("whyExhibit.description") }}
        </p>
      </div>

      <div
        class="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:mt-10 lg:grid-cols-3"
      >
        <MainProgramCard
          v-for="type in types"
          :key="type.iconName"
          :program="type"
        />
      </div>

      <div class="mt-8 flex justify-center">
        <nuxt-link
          :to="localePath('/book-space')"
          class="bg-primary text-primary-foreground hover:bg-primary/80 flex items-center justify-center gap-x-2 rounded-lg px-5 py-3 text-center font-semibold tracking-tight transition active:scale-98"
          v-ripple
        >
          <Icon name="hugeicons:store-01" class="size-5" />
          <span>{{ $t("whyExhibit.cta") }}</span>
        </nuxt-link>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();
const localePath = useLocalePath();

const types = computed(() => [
  {
    iconName: "hugeicons:factory-01",
    title: t("whyExhibit.types.manufacturers.title"),
    description: t("whyExhibit.types.manufacturers.description"),
  },
  {
    iconName: "hugeicons:truck-delivery",
    title: t("whyExhibit.types.importersDistributors.title"),
    description: t("whyExhibit.types.importersDistributors.description"),
  },
  {
    iconName: "hugeicons:package",
    title: t("whyExhibit.types.oemOdm.title"),
    description: t("whyExhibit.types.oemOdm.description"),
  },
  {
    iconName: "hugeicons:store-01",
    title: t("whyExhibit.types.retailersResellers.title"),
    description: t("whyExhibit.types.retailersResellers.description"),
  },
  {
    iconName: "hugeicons:paint-brush-01",
    title: t("whyExhibit.types.artisansSpecialty.title"),
    description: t("whyExhibit.types.artisansSpecialty.description"),
  },
]);
</script>
