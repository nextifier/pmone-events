<template>
  <!-- Dua fase berdampingan di grid hairline, masing-masing dibuka tanggalnya.
       Sengaja bukan tabs supaya teks kedua fase tetap ada di DOM. -->
  <section id="event-format">
    <div class="container">
      <div class="max-w-2xl">
        <h2 class="section-title">{{ $t("eventFormat.title") }}</h2>
        <p class="section-description mt-3">
          {{ $t("eventFormat.description") }}
        </p>
      </div>

      <!-- Kolom ditulis eksplisit, bukan auto-fit: dengan hanya dua item,
           auto-fit menyisakan track ketiga yang collapse ke 0px tapi tetap
           terhitung, jadi GridFill menambah satu sel bermotif yang tidak ada
           gunanya. -->
      <GridFill
        :count="phases.length"
        :cols="1"
        :min-col-width="false"
        rounded="2xl"
        class="mt-10 md:grid-cols-2"
      >
        <div
          v-for="phase in phases"
          :key="phase.title"
          class="flex flex-col p-6 sm:p-8"
        >
          <!-- Angka tanggalnya visual saja. Screen reader membaca rentang penuh
               dari satu pesan i18n, bukan "08 09 Oktober". -->
          <div class="flex items-baseline gap-x-2" aria-hidden="true">
            <template v-for="(date, i) in phase.dates" :key="date">
              <span
                v-if="i > 0"
                class="text-muted-foreground text-3xl font-medium tracking-tighter sm:text-4xl"
                >-</span
              >
              <span
                class="text-foreground text-3xl font-semibold tracking-tighter tabular-nums sm:text-4xl"
                >{{ date }}</span
              >
            </template>
            <span class="text-muted-foreground ml-1 tracking-tight">{{
              $t("eventFormat.month")
            }}</span>
          </div>
          <span class="sr-only">{{ phase.dateRange }}</span>

          <div class="text-muted-foreground mt-4 flex items-center gap-x-2">
            <Icon :name="phase.icon" class="size-5 shrink-0" />
            <span class="text-sm tracking-tight sm:text-base">{{
              phase.schedule
            }}</span>
          </div>

          <h3
            class="text-foreground mt-1 text-xl font-semibold tracking-tighter sm:text-2xl"
          >
            {{ phase.title }}
          </h3>

          <p class="mt-2 max-w-md tracking-tight">{{ phase.description }}</p>

          <!-- Placeholder sementara sampai foto final tersedia. Kembalikan blok
               di bawah ini kalau gambarnya sudah ada:
          <div class="bg-muted mt-auto overflow-hidden rounded-2xl pt-8">
            <NuxtImg
              :src="phase.image"
              :alt="phase.title"
              class="aspect-[16/10] w-full object-cover select-none"
              width="800"
              height="500"
              sizes="100vw lg:600px"
              loading="lazy"
              decoding="async"
              draggable="false"
              format="webp"
            />
          </div>
          -->
        </div>
      </GridFill>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();

// Tanggal edisi 2026 (8-11 Oktober) ditulis di sini, bukan di i18n, karena ini
// angka yang sama di semua bahasa.
const layout = [
  {
    dates: ["08", "09"],
    icon: "hugeicons:briefcase-01",
    image: "/img/programs/program-1.jpg",
  },
  {
    dates: ["10", "11"],
    icon: "hugeicons:balloons",
    image: "/img/programs/program-4.jpg",
  },
];

const phases = computed(() =>
  layout.map((item, i) => ({
    ...item,
    schedule: t(`eventFormat.days.${i}.schedule`),
    // Tanpa leading zero: yang dibaca screen reader harus terdengar seperti
    // tanggal yang diucapkan, bukan seperti angka di kartunya.
    dateRange: t("eventFormat.dateRange", {
      from: Number(item.dates[0]),
      to: Number(item.dates[item.dates.length - 1]),
      month: t("eventFormat.month"),
    }),
    title: t(`eventFormat.days.${i}.title`),
    description: t(`eventFormat.days.${i}.description`),
  })),
);
</script>
