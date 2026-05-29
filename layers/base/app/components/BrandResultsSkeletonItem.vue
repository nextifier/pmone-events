<template>
  <!-- Mirrors BrandGridItem's internal layout so heights match (no shift). -->
  <div class="pt-6">
    <!-- Avatar -->
    <div class="flex justify-center">
      <Skeleton class="size-16 rounded-full" />
    </div>

    <!-- Brand name (2 lines) -->
    <div class="mt-3 flex flex-col items-center gap-y-1.5 px-2">
      <Skeleton class="h-3.5 w-4/5" />
      <Skeleton class="h-3.5 w-3/5" />
    </div>

    <!-- Categories -->
    <div class="mt-2 flex justify-center px-2">
      <Skeleton class="h-3 w-1/2" />
    </div>

    <!-- Booth + promotion -->
    <div class="mt-4 grid w-full grid-cols-2 gap-x-2">
      <div
        class="bg-muted mb-1 ml-1 flex flex-col items-center justify-center gap-y-1 justify-self-start rounded-lg px-2.5 py-2"
      >
        <Skeleton class="h-2.5 w-10" />
        <Skeleton class="h-3.5 w-12" />
      </div>
      <Skeleton class="h-14 w-full rounded-tl-xl" />
    </div>
  </div>
</template>
