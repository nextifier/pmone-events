<template>
  <section id="facts-and-figures">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="mb-3 font-medium uppercase">{{ content.subtitle }}</span>
        <h2 class="section-title-large">
          {{ content.title }}
        </h2>

        <p
          class="text-foreground/80 mx-auto mt-6 max-w-3xl text-center text-base tracking-tight text-balance sm:text-lg"
        >
          {{ content.description }}
        </p>
      </div>

      <div
        ref="statsContainer"
        class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4"
      >
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="border-border flex items-start gap-2 rounded-xl border px-4 py-8 sm:px-8"
        >
          <div class="flex grow flex-col">
            <span class="tracking-tight">{{ stat.label }}</span>

            <NumberFlow
              class="text-primary mt-1 text-4xl font-extrabold tracking-tighter"
              :value="statValues[index]"
              :format="{ notation: 'compact' }"
              :prefix="stat.prefix"
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
const content = computed(() => useContentStore().components.factsAndFigures);

const stats = ref([
  {
    prefix: "",
    value: 450000,
    label: "Total Visitors",
    description: "from 45 countries",
    icon: "lucide:users-round",
  },
  {
    prefix: "",
    value: 5000,
    label: "Total Exhibitors",
    description: "from 25 countries",
    icon: "lucide:layers-3",
  },
  {
    prefix: "$",
    value: 7000000000,
    label: "Transaction Value",
    icon: "lucide:circle-dollar-sign",
  },
  {
    prefix: "",
    value: 60000,
    label: "Total Leads",
    icon: "lucide:handshake",
  },
]);

const statsContainer = ref();
const isInView = useElementVisibility(statsContainer, { threshold: 0.5 });

// Set all values to 0 initially
const statValues = ref(stats.value.map(() => 0));

watch(
  isInView,
  (isVisible) => {
    if (isVisible) {
      stats.value.forEach((stat, index) => {
        statValues.value[index] = stat.value; // Update to original value when in view
      });
    }
  },
  { immediate: true },
);
</script>
