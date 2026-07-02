<template>
  <section id="business-segments">
    <div class="container-wider">
      <div class="flex flex-col items-center text-center">
        <h2
          class="section-title-large relative isolate !leading-[1] font-extrabold tracking-tighter text-balance"
          v-html="$t('businessSegments.title')"
        ></h2>

        <p class="section-description mt-4 sm:mt-8">
          {{ $t('businessSegments.description') }}
        </p>
      </div>

      <div
        class="bg-border *:bg-background relative mt-8 grid grid-cols-1 gap-px p-px *:relative sm:grid-cols-2 lg:mt-10 lg:grid-cols-3"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="flex flex-col items-start gap-y-3 px-6 py-8 pb-10"
        >
          <div
            class="bg-muted flex size-14 shrink-0 items-center justify-center rounded-3xl"
          >
            <Icon :name="item.icon" class="text-foreground size-6" />
          </div>
          <div class="flex flex-col items-start gap-y-1">
            <h3
              class="text-foreground text-base font-semibold tracking-tighter sm:text-xl"
            >
              {{ item.title }}
            </h3>
            <p class="text-muted-foreground tracking-tight">
              {{ item.description }}
            </p>
          </div>
        </div>

        <div
          class="bg-pattern-diagonal hidden items-center justify-center px-6 py-8 [--pattern-fg:var(--color-primary)]/10 sm:flex"
        ></div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();

const items = computed(() => [
  {
    title: t("businessSegments.items.0.title"),
    description: t("businessSegments.items.0.description"),
    icon: "hugeicons:store-01",
  },
  {
    title: t("businessSegments.items.1.title"),
    description: t("businessSegments.items.1.description"),
    icon: "hugeicons:briefcase-dollar",
  },
  {
    title: t("businessSegments.items.2.title"),
    description: t("businessSegments.items.2.description"),
    icon: "hugeicons:ai-scan",
  },
  {
    title: t("businessSegments.items.3.title"),
    description: t("businessSegments.items.3.description"),
    icon: "hugeicons:checkmark-badge-04",
  },
  {
    title: t("businessSegments.items.4.title"),
    description: t("businessSegments.items.4.description"),
    icon: "hugeicons:shopping-cart-check-02",
  },
]);
</script>
