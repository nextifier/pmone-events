<template>
  <!-- Daftar bernomor, ditutup panel CTA bermotif. Tanpa ikon per baris: angka
       01-04 sudah jadi penandanya. -->
  <section id="why-exhibit">
    <div class="container">
      <div class="max-w-2xl">
        <span class="section-subtitle">{{ $t("whyExhibit.subtitle") }}</span>
        <h2 class="section-title mt-2">{{ $t("whyExhibit.title") }}</h2>
        <p class="section-description mt-3">
          {{ $t("whyExhibit.description") }}
        </p>
      </div>

      <!-- Daftar bernomor tanpa kotak. GridFill dengan cols=1 di sini cuma
           divide-y yang dibungkus mesin grid: fillerCount-nya secara matematis
           selalu 0, tapi ResizeObserver-nya tetap jalan tiap resize. Panel CTA
           di bawah yang jadi satu-satunya kotak, dan itu memang yang harus
           paling terlihat. Angkanya penanda visual, bukan urutan langkah, jadi
           <ul> dan bukan <ol>. -->
      <ul class="divide-border/60 border-border/60 mt-10 divide-y border-y">
        <li
          v-for="(item, index) in items"
          :key="item.title"
          class="grid grid-cols-[auto_1fr] items-baseline gap-x-5 py-6 sm:gap-x-8 sm:py-8 lg:grid-cols-[auto_minmax(0,18rem)_1fr]"
        >
          <span
            class="text-muted-foreground text-3xl font-semibold tracking-tighter tabular-nums sm:text-4xl"
            aria-hidden="true"
            >{{ String(index + 1).padStart(2, "0") }}</span
          >

          <h3
            class="text-foreground text-lg font-semibold tracking-tighter sm:text-xl"
          >
            {{ item.title }}
          </h3>

          <!-- Kolomnya 1fr, tapi teksnya dibatasi: tanpa cap, barisnya mencapai
               89 karakter di 1440px, jauh di atas measure yang enak dibaca. -->
          <p
            class="col-start-2 mt-1 max-w-2xl tracking-tight lg:col-start-3 lg:mt-0"
          >
            {{ item.description }}
          </p>
        </li>
      </ul>

      <div
        class="bg-pattern-diagonal border-border mt-10 flex flex-col items-start gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <p class="text-foreground text-lg font-medium tracking-tighter sm:text-xl">
          {{ $t("whyExhibit.ctaNote") }}
        </p>

        <Button
          :to="localePath('/book-space')"
          size="lg"
          class="shrink-0"
          v-ripple
        >
          {{ $t("whyExhibit.cta") }}
          <Icon name="hugeicons:arrow-right-01" />
        </Button>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();
const localePath = useLocalePath();

const ITEM_COUNT = 4;

const items = computed(() =>
  Array.from({ length: ITEM_COUNT }, (_, i) => ({
    title: t(`whyExhibit.items.${i}.title`),
    description: t(`whyExhibit.items.${i}.description`),
  })),
);
</script>
