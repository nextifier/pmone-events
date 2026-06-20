<script setup>
import { Skeleton } from "../ui/skeleton";

defineProps({
  // How many placeholder cards to render (defaults to a typical 3-up grid).
  count: { type: Number, default: 3 },
});
</script>

<template>
  <div class="container">
    <section>
      <!-- Section heading (matches "Entry Tickets" + subtitle) -->
      <div class="flex flex-col items-center gap-y-3 text-center">
        <Skeleton class="h-9 w-52 rounded-lg" />
        <Skeleton class="h-5 w-72 max-w-full rounded" />
      </div>

      <div class="mx-auto mt-6 grid grid-cols-1 gap-4 lg:mt-8 xl:grid-cols-3">
        <div
          v-for="n in count"
          :key="n"
          class="border-border bg-background flex h-full flex-col overflow-hidden rounded-3xl border"
        >
          <div class="flex grow flex-col gap-y-4 px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6">
            <!-- Poster + title -->
            <div class="flex items-center gap-x-3">
              <Skeleton class="size-16 shrink-0 rounded-xl lg:size-18" />
              <div class="flex flex-col gap-y-2">
                <Skeleton class="h-4 w-32 rounded" />
                <Skeleton class="h-3 w-40 rounded" />
              </div>
            </div>

            <!-- Badges -->
            <div class="flex flex-wrap gap-1.5">
              <Skeleton class="h-7 w-24 rounded-full" />
              <Skeleton class="h-7 w-28 rounded-full" />
            </div>

            <!-- Benefits (check icon + line) -->
            <div class="flex flex-col gap-y-2.5">
              <div v-for="i in 4" :key="i" class="flex items-center gap-x-1.5">
                <Skeleton class="size-4 shrink-0 rounded-full" />
                <Skeleton class="h-3.5 rounded" :class="i === 4 ? 'w-1/2' : 'w-full'" />
              </div>
            </div>
          </div>

          <!-- Footer: perforation + price + Add button -->
          <div
            class="border-border flex grow-0 items-center justify-between gap-x-3 border-t border-dashed px-5 py-3 sm:px-8 sm:py-4"
          >
            <Skeleton class="h-6 w-24 rounded" />
            <Skeleton class="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
