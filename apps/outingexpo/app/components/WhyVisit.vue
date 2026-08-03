<template>
  <!-- Bentuk paling polos di halaman ini: empat kolom teks tanpa border, tanpa
       ikon, tanpa kartu. Sengaja, karena section ini duduk persis di bawah blok
       About yang sudah berat dengan gambar. -->
  <section id="why-visit">
    <div class="container">
      <h2 class="section-title max-w-3xl">{{ $t("whyVisit.subheading") }}</h2>

      <div
        class="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div v-for="item in items" :key="item.title">
          <h3
            class="text-foreground text-base font-semibold tracking-tighter sm:text-lg"
          >
            {{ item.title }}
          </h3>
          <p class="mt-1.5 tracking-tight">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();

const ITEM_COUNT = 4;

const items = computed(() =>
  Array.from({ length: ITEM_COUNT }, (_, i) => ({
    title: t(`whyVisit.items.${i}.title`),
    description: t(`whyVisit.items.${i}.description`),
  })),
);
</script>
