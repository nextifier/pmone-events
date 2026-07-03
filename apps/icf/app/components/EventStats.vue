<template>
  <section id="event-stats">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="section-subtitle mb-3 uppercase">{{
          $t("eventStats.subtitle")
        }}</span>
        <h2 class="section-title">
          {{ $t("eventStats.title") }}
        </h2>

        <p
          class="text-foreground/80 mx-auto mt-2 max-w-3xl text-center text-base tracking-tight text-balance sm:text-lg"
        >
          {{ $t("eventStats.description") }}
        </p>
      </div>

      <div
        ref="statsContainer"
        class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:mt-10 lg:grid-cols-5"
      >
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="border-border flex items-start gap-2 rounded-xl border px-4 py-8 sm:px-6"
        >
          <div class="flex grow flex-col">
            <span class="tracking-tight">{{ stat.label }}</span>

            <NumberFlow
              class="text-foreground mt-1 text-4xl font-semibold tracking-tighter"
              :value="statValues[index]"
              :format="stat.format"
              :prefix="stat.prefix"
              :suffix="stat.suffix"
            />

            <span
              v-if="stat.description"
              class="text-muted-foreground text-xs tracking-tight sm:text-sm"
              >{{ stat.description }}</span
            >
          </div>

          <Icon
            :name="stat.icon"
            class="text-muted-foreground size-5 shrink-0 sm:size-6"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();

const stats = computed(() => [
  {
    value: 45910,
    format: { notation: "standard", useGrouping: true },
    prefix: "",
    suffix: "",
    label: t("eventStats.stats.visitors.label"),
    description: t("eventStats.stats.visitors.description"),
    icon: "hugeicons:user-multiple",
  },
  {
    value: 200,
    format: { notation: "standard" },
    prefix: "",
    suffix: "+",
    label: t("eventStats.stats.brands.label"),
    description: t("eventStats.stats.brands.description"),
    icon: "hugeicons:store-01",
  },
  {
    value: 40,
    format: { notation: "standard" },
    prefix: "",
    suffix: "+",
    label: t("eventStats.stats.media.label"),
    description: t("eventStats.stats.media.description"),
    icon: "hugeicons:news",
  },
  {
    value: 1200000000,
    format: { notation: "compact", maximumFractionDigits: 1 },
    prefix: "IDR ",
    suffix: "",
    label: t("eventStats.stats.transaction.label"),
    description: t("eventStats.stats.transaction.description"),
    icon: "hugeicons:money-bag-02",
  },
  {
    value: 20,
    format: { notation: "standard" },
    prefix: "",
    suffix: "+",
    label: t("eventStats.stats.activities.label"),
    description: t("eventStats.stats.activities.description"),
    icon: "hugeicons:calendar-03",
  },
]);

const statsContainer = ref();
const isInView = useElementVisibility(statsContainer, { threshold: 0.5 });

// Start every counter at 0, then animate to the real value once scrolled into view.
const statValues = ref(stats.value.map(() => 0));

watch(
  isInView,
  (isVisible) => {
    if (isVisible) {
      stats.value.forEach((stat, index) => {
        statValues.value[index] = stat.value;
      });
    }
  },
  { immediate: true },
);
</script>
