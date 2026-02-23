<template>
  <NuxtLink :to="`/guests/${guest.slug}`" class="@container">
    <div class="group relative isolate">
      <div
        v-if="guest.transparentBackground"
        class="bg-muted/50 absolute inset-x-0 bottom-0 z-0 aspect-[9/10] w-full overflow-hidden rounded-3xl"
      >
        <NuxtImg
          :src="guest.photos[0]"
          :alt="guest.name"
          class="pointer-events-none h-full w-full scale-150 object-cover opacity-10 blur-lg transition-opacity duration-500 select-none group-hover:opacity-40"
          width="440"
          height="550"
          sizes="100vw sm:600px xl:800px"
          format="webp"
          loading="lazy"
        />
      </div>

      <NuxtImg
        :src="guest.photos[0]"
        :alt="guest.name"
        class="pointer-events-none relative z-10 aspect-[4/5] h-full w-full rounded-3xl object-cover select-none"
        width="440"
        height="550"
        sizes="100vw sm:600px xl:800px"
        format="webp"
        loading="lazy"
      />
    </div>

    <div class="flex flex-col pt-2">
      <div class="flex items-start justify-between gap-x-0">
        <div class="flex flex-col gap-y-0.5">
          <span
            class="line-clamp-1 text-base font-semibold tracking-tight text-black @[300px]:text-xl dark:text-white"
            >{{ guest.name }}</span
          >

          <span class="text-xs tracking-tight @[300px]:text-sm">{{
            guest.categories.join(", ")
          }}</span>
        </div>

        <div
          v-if="guest.appearanceDate"
          class="flex aspect-square w-11 shrink-0 flex-col items-center justify-center gap-y-1 rounded-2xl bg-gray-100 text-center text-black sm:w-14 dark:bg-gray-900 dark:text-white"
        >
          <span class="!leading-none font-semibold tracking-tighter">{{
            guest.appearanceDate.date
          }}</span>
          <span class="text-xs !leading-none">{{
            guest.appearanceDate.month
          }}</span>
        </div>
      </div>

      <div class="mt-3 flex gap-2">
        <!-- <span
          v-if="showCategory"
          class="line-clamp-1 flex items-center justify-center rounded-xl bg-gray-100 p-2.5 text-center text-xs tracking-tight @[300px]:text-sm dark:bg-gray-900"
          >{{ guest.categories.join(", ") }}</span
        >

        <span
          class="flex items-center justify-center gap-1 rounded-xl border border-transparent bg-gray-100 p-2.5 text-center text-xs tracking-tight @[300px]:text-sm dark:bg-gray-900"
        >
          <span>{{ guest.appearanceDate }}</span>
        </span> -->

        <!-- <nuxt-link
          v-if="showViewDetailButton"
          :to="`/guests/${guest.slug}`"
          class="line-clamp-1 flex items-center justify-center gap-1 rounded-xl border border-gray-200 p-2.5 text-center text-xs tracking-tight text-black transition hover:border-transparent hover:bg-black hover:text-white active:scale-95 @[300px]:text-sm dark:border-gray-700 dark:text-white dark:hover:border-transparent dark:hover:bg-white dark:hover:text-black"
        >
          <span>View Details</span>
          <IconArrowUpRight class="size-3.5 shrink-0" />
        </nuxt-link> -->
      </div>

      <!-- <nuxt-link
        v-if="guest.meetAndGreetAvailable"
        to="/meet-and-greet"
        class="mt-2.5 line-clamp-1 flex items-center justify-center gap-1.5 rounded-xl bg-black p-2.5 text-center text-xs tracking-tight text-white transition hover:bg-opacity-80 @[300px]:text-sm dark:bg-white dark:text-black dark:hover:bg-opacity-80"
      >
        <IconTicketStar class="h-4" />
        <span>Meet and Greet</span>
      </nuxt-link> -->
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  guest: Object,
  showCategory: {
    type: Boolean,
    default: true,
  },
  showViewDetailButton: {
    type: Boolean,
    default: false,
  },
  elementIsLink: {
    type: Boolean,
    default: true,
  },
});
</script>

<style scoped>
* {
  @apply select-none;
}
</style>
