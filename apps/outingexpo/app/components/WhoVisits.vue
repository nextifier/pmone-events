<template>
  <!-- Dua kelompok audiens di grid hairline, ditutup satu baris breakdown. -->
  <section id="who-visits">
    <div class="container">
      <div class="max-w-2xl">
        <h2 class="section-title">{{ $t("whoVisits.title") }}</h2>
        <p class="section-description mt-3">
          {{ $t("whoVisits.description") }}
        </p>
      </div>

      <GridFill
        :count="groups.length"
        :cols="1"
        min-col-width="320px"
        rounded="2xl"
        class="mt-10"
      >
        <div
          v-for="group in groups"
          :key="group.itemsKey"
          class="p-6 sm:p-8"
        >
          <div class="flex items-center gap-x-2.5">
            <Icon
              :name="group.icon"
              class="text-muted-foreground size-5 shrink-0"
            />
            <h3 class="text-foreground text-lg font-semibold tracking-tighter">
              {{ group.title }}
            </h3>
          </div>

          <ul class="divide-border/60 mt-4 divide-y">
            <li
              v-for="(item, i) in tm(group.itemsKey)"
              :key="i"
              class="py-2.5 tracking-tight"
            >
              {{ rt(item) }}
            </li>
          </ul>
        </div>
      </GridFill>

      <p class="text-muted-foreground mt-8 text-sm tracking-tight sm:text-base">
        {{ $t("whoVisits.breakdownLabel") }}: {{ breakdownLine }}
      </p>
    </div>
  </section>
</template>

<script setup>
const { t, tm, rt } = useI18n();

const groups = computed(() => [
  {
    title: t("whoVisits.corporateTitle"),
    itemsKey: "whoVisits.corporateItems",
    icon: "hugeicons:building-06",
  },
  {
    title: t("whoVisits.communityTitle"),
    itemsKey: "whoVisits.communityItems",
    icon: "hugeicons:user-group",
  },
]);

// Komposisi pengunjung Indonesia Outing Expo 2025.
const shares = [
  { key: "hr", value: 26 },
  { key: "public", value: 22 },
  { key: "corporateTeam", value: 18 },
  { key: "eventPlanner", value: 16 },
  { key: "groupHolidays", value: 13 },
  { key: "community", value: 5 },
];

const breakdownLine = computed(() =>
  shares
    .map((share) => `${t(`whoVisits.breakdown.${share.key}`)} ${share.value}%`)
    .join(", "),
);
</script>
