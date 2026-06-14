<template>
  <section id="why-visit">
    <div class="container">
      <div class="flex flex-col items-start text-left">
        <span class="text-gradient-accent">{{ $t("whyVisit.heading") }}</span>
        <h2 class="section-title mt-2">{{ $t("whyVisit.subheading") }}</h2>
      </div>

      <div
        class="mt-4 grid grid-cols-1 gap-x-8 gap-y-8 sm:mt-6 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex flex-col items-start gap-y-2"
        >
          <div
            class="border-border flex size-12 items-center justify-center rounded-2xl border"
          >
            <Icon
              v-if="item.iconName"
              :name="item.iconName"
              class="text-accent size-6"
            />
          </div>
          <h3
            v-if="item.title"
            class="text-primary text-base font-semibold tracking-tighter sm:text-lg"
          >
            {{ item.title }}
          </h3>
          <p v-if="item.description" class="tracking-tight">
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
  "hugeicons:agreement-01",
  "hugeicons:ai-idea",
  "hugeicons:halal",
  "hugeicons:ticket-star",
];

const items = computed(() =>
  icons.map((iconName, i) => ({
    iconName,
    title: t(`whyVisit.items.${i}.title`),
    description: t(`whyVisit.items.${i}.description`),
  })),
);
</script>
