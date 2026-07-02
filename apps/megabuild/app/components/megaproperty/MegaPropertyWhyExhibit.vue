<template>
  <section id="why-exhibit">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span class="text-gradient-accent font-medium tracking-tight">{{
          $t("megaProperty.whyExhibit.label")
        }}</span>
        <h2 class="section-title mt-2.5">
          {{ $t("megaProperty.whyExhibit.title") }}
        </h2>
        <p
          class="text-muted-foreground mx-auto mt-2 max-w-2xl text-base tracking-tight text-balance sm:text-lg"
        >
          {{ $t("megaProperty.whyExhibit.description") }}
        </p>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(reason, index) in reasons"
          :key="index"
          class="border-border bg-background flex flex-col rounded-xl border px-5 py-7"
        >
          <Icon :name="reason.icon" class="text-foreground size-7" />

          <h3 class="text-foreground mt-4 text-lg font-semibold tracking-tight">
            {{ reason.title }}
          </h3>

          <p class="text-muted-foreground mt-1 tracking-tight">
            {{ reason.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();

const icons = [
  "hugeicons:user-multiple-02",
  "hugeicons:idea",
  "hugeicons:agreement-01",
  "hugeicons:award-01",
  "hugeicons:chart-line-data-01",
  "hugeicons:puzzle",
];

const reasons = computed(() =>
  icons.map((icon, i) => ({
    icon,
    title: t(`megaProperty.whyExhibit.reasons.${i}.title`),
    description: t(`megaProperty.whyExhibit.reasons.${i}.description`),
  }))
);
</script>
