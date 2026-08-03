<template>
  <!-- Daftar bernomor dalam satu kolom GridFill, ditutup panel CTA bermotif.
       Tanpa ikon per baris: angka 01-04 sudah jadi penandanya. -->
  <section id="why-exhibit">
    <div class="container">
      <div class="max-w-2xl">
        <span class="section-subtitle">{{ $t("whyExhibit.subtitle") }}</span>
        <h2 class="section-title mt-2">{{ $t("whyExhibit.title") }}</h2>
        <p class="section-description mt-3">
          {{ $t("whyExhibit.description") }}
        </p>
      </div>

      <GridFill
        :count="items.length"
        :cols="1"
        :min-col-width="false"
        rounded="2xl"
        class="mt-10"
      >
        <div
          v-for="(item, index) in items"
          :key="item.title"
          class="grid grid-cols-[auto_1fr] items-baseline gap-x-5 p-6 sm:gap-x-8 sm:p-8 lg:grid-cols-[auto_minmax(0,18rem)_1fr]"
        >
          <span
            class="text-muted-foreground/50 text-3xl font-semibold tracking-tighter tabular-nums sm:text-4xl"
            >{{ String(index + 1).padStart(2, "0") }}</span
          >

          <h3
            class="text-foreground text-lg font-semibold tracking-tighter sm:text-xl"
          >
            {{ item.title }}
          </h3>

          <p class="col-start-2 mt-1 tracking-tight lg:col-start-3 lg:mt-0">
            {{ item.description }}
          </p>
        </div>
      </GridFill>

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
          <Icon name="hugeicons:arrow-right-01" class="size-4" />
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
