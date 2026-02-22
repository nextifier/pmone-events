<template>
  <div
    class="bg-muted/60 @container relative isolate flex h-full flex-col gap-4 overflow-hidden rounded-3xl p-4 sm:p-5"
  >
    <div class="flex flex-col items-center gap-x-2 gap-y-3 @3xs:flex-row">
      <div
        class="skeleton flex size-20 shrink-0 items-center justify-center rounded-full @3xs:size-18"
      ></div>

      <div class="flex w-full flex-col items-center gap-y-2 @3xs:items-start">
        <div class="skeleton h-4 w-full"></div>
        <div class="skeleton h-3 w-3/4"></div>
      </div>
    </div>

    <div
      v-if="props.showBoothNumber || props.showPromotionImages"
      class="flex items-start justify-center gap-2 @3xs:justify-between"
    >
      <div
        v-if="props.showBoothNumber"
        class="bg-border/50 flex flex-col items-center justify-center gap-1.5 rounded-xl p-2.5 @3xs:h-full @3xs:rounded-2xl"
      >
        <div class="skeleton h-2 w-10"></div>
        <div class="skeleton h-3 w-14"></div>
      </div>

      <div
        v-if="props.showPromotionImages"
        class="relative isolate flex flex-col items-center justify-end -space-y-13 @3xs:flex-row @3xs:space-y-0 @3xs:-space-x-5"
      >
        <div
          v-for="(_, index) in 2"
          class="skeleton bg-muted flex size-16 items-center justify-center overflow-hidden rounded-2xl border-2 shadow-md transition hover:scale-110 nth-2:scale-90 @3xs:odd:-rotate-12 @3xs:even:rotate-12 @3xs:nth-2:scale-100"
          :style="`z-index: ${2 - index}`"
        ></div>
      </div>
    </div>

    <div class="mt-12 w-[calc(100%-3.5rem)] @3xs:mt-8">
      <div v-if="props.showCreatedAt" class="skeleton h-3 w-16 @3xs:w-28"></div>
    </div>

    <InvertedBorderRadius position="bottom-right" />
  </div>
</template>

<script setup>
const props = defineProps({
  showCreatedAt: {
    type: Boolean,
    default: true,
  },
  showBoothNumber: {
    type: Boolean,
    default: true,
  },
  showPromotionImages: {
    type: Boolean,
    default: true,
  },
});
</script>
