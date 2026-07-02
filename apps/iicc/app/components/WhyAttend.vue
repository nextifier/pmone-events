<template>
  <section id="why-attend">
    <div class="container">
      <div class="flex flex-col items-start">
        <span
          class="border-foreground rounded-full border px-3 py-1.5 text-base font-medium tracking-tighter sm:text-lg"
          >{{ $t("whyAttend.badge") }}</span
        >
        <h2 class="section-title mt-2">
          {{ $t("whyAttend.title") }}
          <span class="text-gradient-accent">{{
            $t("whyAttend.titleAccent")
          }}</span>
        </h2>

        <p class="section-description mt-3 w-full">
          {{ $t("whyAttend.description") }}
        </p>
      </div>

      <div
        class="mt-8 grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-x-4 gap-y-4"
      >
        <div
          v-for="(reason, index) in reasons"
          :key="reason.title"
          class="border-border/50 bg-muted/30 relative flex flex-col items-start rounded-2xl border px-4 py-6 sm:px-6"
        >
          <div
            class="bg-muted text-accent flex size-12 items-center justify-center rounded-xl"
          >
            <Icon :name="reason.icon" class="size-5" />
          </div>

          <h3 class="text-foreground mt-4 text-xl font-medium tracking-tight">
            {{ reason.title }}
          </h3>

          <p class="mt-2 tracking-tight">
            {{ reason.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const appConfig = useAppConfig();
const { t } = useI18n();

const reasons = computed(() => [
  {
    icon: "hugeicons:chart-line-data-01",
    title: t("whyAttend.reasons.stayAhead.title"),
    description: t("whyAttend.reasons.stayAhead.description"),
  },
  {
    icon: "hugeicons:user-group",
    title: t("whyAttend.reasons.connect.title"),
    description: t("whyAttend.reasons.connect.description"),
  },
  {
    icon: "hugeicons:sustainable-energy",
    title: t("whyAttend.reasons.addressChallenges.title"),
    description: t("whyAttend.reasons.addressChallenges.description"),
  },
  {
    icon: "hugeicons:ai-innovation-01",
    title: t("whyAttend.reasons.discoverInnovation.title"),
    description: t("whyAttend.reasons.discoverInnovation.description"),
  },
  {
    icon: "hugeicons:policy",
    title: t("whyAttend.reasons.shapePolicy.title"),
    description: t("whyAttend.reasons.shapePolicy.description"),
  },
]);
</script>
