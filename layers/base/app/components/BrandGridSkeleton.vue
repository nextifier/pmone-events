<template>
  <!-- GRID: full-bleed on mobile + one framed grid with hairline cells -->
  <div v-if="variant === 'grid'" class="mx-[calc(50%_-_50vw)] sm:mx-0">
    <div class="border-border overflow-hidden border sm:rounded-lg">
      <div
        class="-mt-px -ml-px grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]"
      >
        <div
          v-for="i in count"
          :key="i"
          class="border-border border-t border-l"
        >
          <BrandResultsSkeletonItem />
        </div>
      </div>
    </div>
  </div>

  <!-- CARD: standalone bordered cards with gaps -->
  <div
    v-else
    class="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-x-2"
  >
    <div
      v-for="i in count"
      :key="i"
      class="bg-card border-border overflow-hidden rounded-xl border"
    >
      <BrandResultsSkeletonItem />
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: { type: String, default: "grid" }, // 'grid' | 'card'
  count: { type: Number, default: 24 },
});
</script>
