<template>
  <section id="target-exhibitors">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="text-gradient-accent font-medium tracking-tight">{{
          $t("megaProperty.exhibitors.label")
        }}</span>
        <h2 class="section-title mt-2.5">
          {{ $t("megaProperty.exhibitors.title") }}
        </h2>
        <p
          class="text-muted-foreground mx-auto mt-2.5 max-w-2xl text-base tracking-tight text-balance sm:text-lg"
        >
          {{ $t("megaProperty.exhibitors.description") }}
        </p>
      </div>

      <div
        class="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:mt-10 xl:grid-cols-4"
      >
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="border-border flex flex-col rounded-xl border px-5 py-7"
        >
          <Icon :name="category.icon" class="text-foreground size-6" />

          <h3 class="text-foreground mt-4 text-lg font-semibold tracking-tight">
            {{ category.title }}
          </h3>

          <ul class="text-muted-foreground mt-2.5 space-y-1.5 tracking-tight">
            <li
              v-for="(item, itemIndex) in category.items"
              :key="itemIndex"
              class="flex items-start gap-2"
            >
              <Icon
                name="hugeicons:tick-02"
                class="text-foreground size-[1lh] shrink-0 scale-80"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Zones -->
      <div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div
          v-for="(zone, index) in zones"
          :key="index"
          class="border-border flex flex-col rounded-xl border px-5 py-7"
        >
          <Icon :name="zone.icon" class="text-foreground size-6" />
          <h3 class="text-foreground mt-4 text-lg font-semibold tracking-tight">
            {{ zone.title }}
          </h3>
          <p class="text-muted-foreground mt-1.5">
            {{ zone.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();

const categoryIcons = [
  "hugeicons:building-02",
  "hugeicons:bank",
  "hugeicons:briefcase-01",
  "hugeicons:ruler",
  "hugeicons:sofa-01",
  "hugeicons:wrench-01",
  "hugeicons:file-validation",
  "hugeicons:cpu",
];

const categoryItemCounts = [4, 4, 4, 4, 4, 4, 4, 4];

const categories = computed(() =>
  categoryIcons.map((icon, i) => ({
    icon,
    title: t(`megaProperty.exhibitors.categories.${i}.title`),
    items: Array.from({ length: categoryItemCounts[i] }, (_, j) =>
      t(`megaProperty.exhibitors.categories.${i}.items.${j}`)
    ),
  }))
);

const zoneIcons = ["hugeicons:paint-brush-01", "hugeicons:building-03"];

const zones = computed(() =>
  zoneIcons.map((icon, i) => ({
    icon,
    title: t(`megaProperty.exhibitors.zones.${i}.title`),
    description: t(`megaProperty.exhibitors.zones.${i}.description`),
  }))
);
</script>
