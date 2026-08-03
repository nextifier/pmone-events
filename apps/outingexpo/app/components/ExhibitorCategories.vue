<template>
  <!-- Lima kategori di grid hairline. Sel sisa ditambal otomatis dengan
       bg-pattern-diagonal, jadi tidak pernah ada sel kosong menggantung. -->
  <section id="exhibitor-categories">
    <div class="container">
      <div class="max-w-2xl">
        <h2 class="section-title">{{ $t("exhibitorCategories.title") }}</h2>
        <p class="section-description mt-3">
          {{ $t("exhibitorCategories.description") }}
        </p>
      </div>

      <GridFill
        :count="categories.length"
        :cols="1"
        min-col-width="300px"
        rounded="2xl"
        class="mt-10"
      >
        <div
          v-for="category in categories"
          :key="category.itemsKey"
          class="flex flex-col p-6 sm:p-8"
        >
          <div class="flex items-center gap-x-2.5">
            <Icon
              :name="category.icon"
              class="text-muted-foreground size-5 shrink-0"
            />
            <h3
              class="text-foreground text-base font-semibold tracking-tighter sm:text-lg"
            >
              {{ category.title }}
            </h3>
          </div>

          <ul class="mt-3 space-y-1.5">
            <li
              v-for="(item, i) in tm(category.itemsKey)"
              :key="i"
              class="text-muted-foreground tracking-tight"
            >
              {{ rt(item) }}
            </li>
          </ul>
        </div>
      </GridFill>

      <div class="mt-6 flex">
        <Button
          :to="localePath('/brands')"
          variant="secondary"
          size="lg"
          v-ripple
        >
          {{ $t("exhibitorCategories.cta") }}
          <Icon name="hugeicons:arrow-right-01" class="size-4" />
        </Button>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t, tm, rt } = useI18n();
const localePath = useLocalePath();

// Urutan icon mengikuti urutan kategori di file locale.
const icons = [
  "hugeicons:award-01",
  "hugeicons:hotel-01",
  "hugeicons:megaphone-01",
  "hugeicons:airplane-01",
  "hugeicons:sparkles",
];

const categories = computed(() =>
  icons.map((icon, i) => ({
    icon,
    title: t(`exhibitorCategories.items.${i}.title`),
    itemsKey: `exhibitorCategories.items.${i}.items`,
  })),
);
</script>
