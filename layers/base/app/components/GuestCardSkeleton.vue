<template>
  <!-- Mirrors GuestCard's layout so heights match (no shift): the photo frame at
       the same ratio and radius, then the caption with its date badge. -->
  <div class="flex flex-col">
    <Skeleton class="w-full rounded-xl sm:rounded-2xl" :style="{ aspectRatio }" />

    <div class="mt-2.5 flex min-h-11 items-center gap-x-2 sm:min-h-12">
      <div class="flex min-w-0 grow flex-col gap-y-0.5">
        <!-- Name line box (text-sm / sm:text-base) -->
        <div class="flex h-5 items-center sm:h-6">
          <Skeleton class="h-3.5 w-3/4 rounded sm:h-4" />
        </div>
        <!-- Title line box (text-sm) -->
        <div class="flex h-5 items-center">
          <Skeleton class="h-3.5 w-1/2 rounded" />
        </div>
      </div>

      <!-- Date badge -->
      <Skeleton class="size-10 shrink-0 rounded-xl" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** CSS aspect-ratio of the photo frame, e.g. "3 / 4". */
    aspectRatio?: string;
  }>(),
  { aspectRatio: "4 / 5" },
);
</script>
