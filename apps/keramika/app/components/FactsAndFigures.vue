<template>
  <section id="facts-and-figures">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="mb-3 font-medium uppercase">Facts & Figures</span>
        <h2 class="section-title">Why Keramika Indonesia Leads the Industry</h2>

        <p
          class="text-foreground/80 mx-auto mt-2 max-w-3xl text-center text-base tracking-tight text-balance sm:text-lg"
        >
          The facts & figures gathered from 21 editions are testament to the
          powerful platform that Keramika Indonesia has provided for thousands
          of businesses to grow.
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
              class="text-primary mt-1 text-4xl font-semibold tracking-tighter"
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
const stats = ref([
  {
    prefix: "",
    value: 400000,
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
    value: 2200000000,
    label: "Transaction Value",
    icon: "lucide:circle-dollar-sign",
  },
  {
    prefix: "",
    value: 55000,
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
