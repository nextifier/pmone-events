<template>
  <!-- Baris angka di grid hairline. Sengaja tanpa ikon: tiap sel di sini adalah
       ukuran, bukan kategori, jadi ikon cuma jadi hiasan. -->
  <section id="event-stats">
    <div class="container">
      <div class="max-w-2xl">
        <span class="section-subtitle">{{ $t("eventStats.subtitle") }}</span>
        <h2 class="section-title mt-2">{{ $t("eventStats.title") }}</h2>
        <p class="section-description mt-3">
          {{ $t("eventStats.description") }}
        </p>
      </div>

      <GridFill
        ref="statsContainer"
        :count="stats.length"
        :cols="2"
        :min-col-width="false"
        rounded="2xl"
        class="mt-10 sm:grid-cols-3 2xl:grid-cols-6"
      >
        <div
          v-for="(stat, index) in stats"
          :key="stat.key"
          class="flex flex-col p-5 sm:p-6"
        >
          <NumberFlow
            class="text-foreground text-4xl font-semibold tracking-tighter sm:text-5xl"
            :value="statValues[index]"
            :format="stat.format"
            :locales="locale"
            :suffix="stat.suffix"
          />

          <span class="mt-2 tracking-tight">{{ stat.label }}</span>

          <span class="text-muted-foreground text-sm tracking-tight">{{
            stat.description
          }}</span>
        </div>
      </GridFill>
    </div>
  </section>
</template>

<script setup>
// `locale` diteruskan ke NumberFlow supaya server dan browser mengelompokkan
// digit dengan cara yang sama. Kalau dibiarkan undefined, keduanya memilih
// locale default masing-masing (10,000 vs 10.000) dan itu muncul sebagai
// hydration mismatch.
const { t, locale } = useI18n();

// Hasil Indonesia Outing Expo 2025, edisi pertama.
const definitions = [
  { key: "visitors", value: 10000, suffix: "+" },
  { key: "brands", value: 100, suffix: "+" },
  { key: "businessMatching", value: 100, suffix: "+" },
  { key: "speakers", value: 15, suffix: "+" },
  { key: "mediaCoverage", value: 20, suffix: "+" },
  { key: "recommendation", value: 95, suffix: "%" },
];

const stats = computed(() =>
  definitions.map((stat) => ({
    ...stat,
    format: { notation: "standard", useGrouping: true },
    label: t(`eventStats.stats.${stat.key}.label`),
    description: t(`eventStats.stats.${stat.key}.description`),
  })),
);

// Ref-nya menunjuk ke komponen GridFill, bukan elemen. useElementVisibility
// lewat unrefElement, jadi $el-nya ikut terbaca.
const statsContainer = ref();
const isInView = useElementVisibility(statsContainer, { threshold: 0.5 });

// Counter mulai dari 0 lalu berjalan ke angka sebenarnya begitu masuk viewport.
const statValues = ref(definitions.map(() => 0));

watch(isInView, (isVisible) => {
  if (!isVisible) return;
  definitions.forEach((stat, index) => {
    statValues.value[index] = stat.value;
  });
});
</script>
