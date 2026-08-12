<template>
  <!-- Dua kelompok audiens sebagai kolom teks polos. Sengaja tanpa kotak:
       tetangganya di kiri dan kanan (EventFormat, ExhibitorCategories) sudah
       grid hairline, jadi section ini yang memberi jeda. Breakdown 2025 turun
       jadi daftar label/angka, bukan satu baris koma, supaya urutan dan
       pemisahnya jadi urusan layout dan bukan urusan penerjemah. -->
  <section id="who-visits">
    <div class="container">
      <div class="max-w-2xl">
        <h2 class="section-title">{{ $t("whoVisits.title") }}</h2>
        <p class="section-description mt-3">
          {{ $t("whoVisits.description") }}
        </p>
      </div>

      <div class="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
        <div v-for="group in groups" :key="group.itemsKey">
          <div class="flex items-center gap-x-2.5">
            <Icon
              :name="group.icon"
              class="text-muted-foreground size-5 shrink-0"
            />
            <h3 class="text-foreground text-lg font-semibold tracking-tighter">
              {{ group.title }}
            </h3>
          </div>

          <ul class="divide-border/60 border-border/60 mt-4 divide-y border-t">
            <li
              v-for="(item, i) in tm(group.itemsKey)"
              :key="i"
              class="py-2.5 tracking-tight"
            >
              {{ rt(item) }}
            </li>
          </ul>
        </div>
      </div>

      <div class="border-border/60 mt-12 border-t pt-6">
        <p class="text-muted-foreground text-sm tracking-tight">
          {{ $t("whoVisits.breakdownLabel") }}
        </p>

        <dl
          class="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          <div v-for="share in shares" :key="share.key">
            <dt class="text-muted-foreground text-sm tracking-tight">
              {{ $t(`whoVisits.breakdown.${share.key}`) }}
            </dt>
            <dd class="mt-0.5 font-medium tracking-tight tabular-nums">
              {{ share.value }}%
            </dd>
          </div>
        </dl>
      </div>
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
</script>
