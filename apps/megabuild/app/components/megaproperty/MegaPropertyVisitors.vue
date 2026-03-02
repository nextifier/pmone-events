<template>
  <section id="target-visitors">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="text-gradient-accent font-medium tracking-tight">{{
          $t("megaProperty.visitors.label")
        }}</span>
        <h2 class="section-title mt-2.5">
          {{ $t("megaProperty.visitors.title") }}
        </h2>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(tier, index) in tiers"
          :key="index"
          class="border-border flex flex-col rounded-xl border px-5 py-7"
        >
          <Icon :name="tier.icon" class="text-primary size-7" />

          <h3
            class="text-foreground mt-4 text-lg font-semibold tracking-tight lg:text-xl"
          >
            {{ tier.title }}
          </h3>

          <ul
            class="text-muted-foreground mt-4 space-y-2 text-sm tracking-tight lg:text-base"
          >
            <li
              v-for="(item, itemIndex) in tier.items"
              :key="itemIndex"
              class="flex items-start gap-2"
            >
              <Icon
                name="hugeicons:tick-02"
                class="text-primary size-[1lh] shrink-0 scale-80"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();

const tierIcons = [
  "hugeicons:crown",
  "hugeicons:user-group",
  "hugeicons:briefcase-01",
];

const tierItemCounts = [3, 3, 4];

const tiers = computed(() =>
  tierIcons.map((icon, i) => ({
    icon,
    title: t(`megaProperty.visitors.tiers.${i}.title`),
    items: Array.from({ length: tierItemCounts[i] }, (_, j) =>
      t(`megaProperty.visitors.tiers.${i}.items.${j}`)
    ),
  }))
);
</script>
