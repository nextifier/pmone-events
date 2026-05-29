<template>
  <div class="frame">
    <div
      class="frame-panel bg-background -m-px overflow-hidden rounded-lg p-0!"
    >
      <!-- Header (matches the real h-11 sortable header) -->
      <div class="border-border flex h-11 items-center gap-x-4 border-b px-3">
        <Skeleton class="h-3 w-28" />
        <Skeleton class="h-3 w-20" />
        <Skeleton class="h-3 w-14" />
        <Skeleton class="hidden h-3 w-24 sm:block" />
        <Skeleton class="hidden h-3 w-16 sm:block" />
        <Skeleton class="ml-auto h-3 w-16" />
      </div>

      <!-- Rows (content-driven height matches the real py-2.5 rows) -->
      <div
        v-for="r in count"
        :key="r"
        class="border-border flex items-center gap-x-4 px-3 py-2.5 last:border-0"
        :class="r < count ? 'border-b' : ''"
      >
        <!-- Brand cell: avatar + name + company -->
        <div class="flex min-w-0 grow items-center gap-x-3 pl-3">
          <Skeleton class="size-10 shrink-0 rounded-full" />
          <div class="flex min-w-0 flex-col gap-y-1.5">
            <Skeleton class="h-3 w-32" />
            <Skeleton class="h-2.5 w-20" />
          </div>
        </div>
        <Skeleton class="h-3 w-20 shrink-0" />
        <Skeleton class="h-3 w-12 shrink-0" />
        <Skeleton class="hidden h-3 w-24 shrink-0 sm:block" />
        <Skeleton class="hidden h-3 w-8 shrink-0 sm:block" />
        <Skeleton class="hidden h-3 w-16 shrink-0 md:block" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 16 },
});
</script>
