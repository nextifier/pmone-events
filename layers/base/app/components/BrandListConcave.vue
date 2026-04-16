<template>
  <div
    class="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-x-4"
  >
    <CardConcave
      v-for="index in count"
      :key="index"
      size="4.5rem"
      offset="1rem"
      gap="3px"
      radius="1.25rem"
      :blur-radius="5"
      body-class="@container flex flex-col gap-4 p-4 sm:p-5"
    >
      <template #protrusion>
        <Skeleton class="size-full rounded-full" />
      </template>

      <div class="flex flex-col items-center gap-x-2 gap-y-3 @3xs:flex-row">
        <!-- Spacer for the protruding avatar area -->
        <div class="hidden size-18 shrink-0 @3xs:block" />

        <div class="flex w-full flex-col items-center gap-y-2 @3xs:items-start">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-3 w-3/4" />
        </div>
      </div>

      <div class="flex items-start justify-center gap-2 @3xs:justify-between">
        <div
          class="flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 @3xs:h-full @3xs:rounded-2xl"
        >
          <Skeleton class="h-2 w-10" />
          <Skeleton class="h-3 w-14" />
        </div>

        <div
          class="relative isolate flex flex-col items-center justify-end -space-y-13 @3xs:flex-row @3xs:space-y-0 @3xs:-space-x-5"
        >
          <Skeleton
            v-for="i in 2"
            :key="i"
            class="flex size-16 items-center justify-center overflow-hidden rounded-2xl border-2 nth-2:scale-90 @3xs:odd:-rotate-12 @3xs:even:rotate-12 @3xs:nth-2:scale-100"
            :style="`z-index: ${2 - i}`"
          />
        </div>
      </div>

      <div class="mt-auto pt-8 @3xs:pt-4">
        <Skeleton class="h-3 w-16 @3xs:w-28" />
      </div>
    </CardConcave>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 12,
  },
});
</script>
