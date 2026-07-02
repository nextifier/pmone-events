<template>
  <section id="programs">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <span
          class="border-foreground rounded-full border px-3 py-1.5 text-base font-medium tracking-tighter sm:text-lg"
          >{{ $t("programs.badge") }}</span
        >
        <h2 class="section-title mt-2">
          {{ $t("programs.title") }}
          <span class="text-gradient-accent">{{
            $t("programs.titleAccent")
          }}</span>
        </h2>

        <p class="section-description mt-3 w-full">
          {{ $t("programs.description") }}
        </p>
      </div>

      <div
        class="mt-10 grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        <div
          v-for="program in programs"
          :key="program.title"
          class="border-border/50 bg-muted/30 flex flex-col items-start rounded-2xl border px-4 py-8"
        >
          <div
            class="bg-muted text-accent flex size-12 items-center justify-center rounded-xl"
          >
            <Icon :name="program.icon" class="size-6" />
          </div>

          <h3
            class="text-foreground mt-4 text-lg font-medium tracking-tight text-balance"
          >
            {{ program.title }}
          </h3>
          <p class="text-body mt-2 text-base tracking-tight text-balance">
            {{ program.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();

const programs = computed(() => [
  {
    icon: "hugeicons:presentation-podium",
    title: t("programs.items.keynote.title"),
    description: t("programs.items.keynote.description"),
  },
  {
    icon: "hugeicons:user-multiple-02",
    title: t("programs.items.panel.title"),
    description: t("programs.items.panel.description"),
  },
  {
    icon: "hugeicons:message-multiple-01",
    title: t("programs.items.dialogue.title"),
    description: t("programs.items.dialogue.description"),
  },
  {
    icon: "hugeicons:agreement-01",
    title: t("programs.items.networking.title"),
    description: t("programs.items.networking.description"),
  },
  {
    icon: "hugeicons:restaurant-01",
    title: t("programs.items.galaDinner.title"),
    description: t("programs.items.galaDinner.description"),
  },
]);
</script>
