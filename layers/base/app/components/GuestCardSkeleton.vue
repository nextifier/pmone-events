<template>
  <!-- Mirrors GuestCard's layout so heights match (no shift): the photo frame at
       the same ratio and radius, then the caption with its date badge and the
       menu trigger. -->
  <div class="flex flex-col">
    <Skeleton class="w-full rounded-xl sm:rounded-2xl" :style="{ aspectRatio }" />

    <div class="mt-2.5 flex min-h-9 items-center sm:min-h-9.5">
      <div class="flex min-w-0 grow items-center gap-x-1">
        <div class="flex min-w-0 grow flex-col">
          <!-- Name line box (text-sm/4.5, sm:text-base/5) -->
          <div class="flex h-4.5 items-center sm:h-5">
            <Skeleton class="h-3 w-3/4 rounded sm:h-3.5" />
          </div>
          <!-- Title line box (text-sm/4.5) -->
          <div class="flex h-4.5 items-center">
            <Skeleton class="h-3 w-1/2 rounded" />
          </div>
        </div>

        <!-- Date badge -->
        <Skeleton class="h-9 w-10 shrink-0 rounded-xl sm:h-9.5" />
      </div>

      <!-- Menu trigger: its glyph, centred in the button's 32px box. -->
      <Skeleton class="mx-2 size-4 shrink-0 rounded" />
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
