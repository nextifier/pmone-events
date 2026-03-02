<template>
  <section id="what-to-expect">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="text-gradient-accent font-medium tracking-tight">{{
          $t("megaProperty.expect.label")
        }}</span>
        <h2 class="section-title mt-2.5">
          {{ $t("megaProperty.expect.title") }}
        </h2>
      </div>

      <div
        class="mt-6 grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="border-border flex flex-col rounded-xl border px-5 py-7"
        >
          <Icon :name="item.icon" class="text-primary size-7" />

          <h3
            class="text-foreground mt-5 text-lg font-semibold tracking-tight lg:text-xl"
          >
            {{ item.title }}
          </h3>

          <p
            class="text-muted-foreground mt-2 text-sm tracking-tight lg:text-base"
          >
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();

const icons = [
  "hugeicons:home-01",
  "hugeicons:mic-01",
  "hugeicons:agreement-01",
  "hugeicons:bank",
];

const items = computed(() =>
  icons.map((icon, i) => ({
    icon,
    title: t(`megaProperty.expect.items.${i}.title`),
    description: t(`megaProperty.expect.items.${i}.description`),
  }))
);
</script>
