<template>
  <section id="topics">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span
          class="border-primary rounded-full border px-3 py-1.5 text-base font-medium tracking-tighter sm:text-lg"
          >{{ $t("themes.badge") }}</span
        >
        <h2 class="section-title mt-2">
          {{ $t("themes.title") }}
          <span class="text-gradient-accent">{{
            $t("themes.titleAccent")
          }}</span>
        </h2>

        <p class="section-description mt-3 w-full">
          {{ $t("themes.description") }}
        </p>
      </div>

      <div class="mx-auto max-w-2xl">
        <div
          v-for="(theme, index) in themes"
          :key="theme.title"
          class="group border-border border-b py-10 last:border-b-0"
        >
          <div class="flex items-center gap-8">
            <div
              class="font-display text-accent/40 text-6xl font-light lg:text-7xl"
            >
              {{ String(index + 1).padStart(2, "0") }}
            </div>

            <div class="flex flex-col gap-y-1">
              <h3 class="text-2xl font-medium tracking-tighter text-balance">
                {{ theme.title }}
              </h3>
              <p class="tracking-tight text-balance">
                {{ theme.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();

const themes = computed(() => [
  {
    title: t("themes.items.recipeSuccess.title"),
    description: t("themes.items.recipeSuccess.description"),
  },
  {
    title: t("themes.items.empowering.title"),
    description: t("themes.items.empowering.description"),
  },
  {
    title: t("themes.items.legacy.title"),
    description: t("themes.items.legacy.description"),
  },
  {
    title: t("themes.items.resiliency.title"),
    description: t("themes.items.resiliency.description"),
  },
  {
    title: t("themes.items.globalMarkets.title"),
    description: t("themes.items.globalMarkets.description"),
  },
]);
</script>
