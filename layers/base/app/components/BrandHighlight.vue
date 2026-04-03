<template>
  <div
    v-if="brands"
    class="3xl:px-6 @container relative isolate rounded-3xl border border-gray-200 px-4 pt-10 pb-8 sm:pt-12 dark:border-gray-800"
  >
    <div
      class="absolute inset-x-0 top-0 flex -translate-y-1/2 items-center justify-center"
    >
      <span
        class="rounded-2xl border border-gray-200 bg-white px-4 py-2 font-semibold tracking-tight text-black dark:border-gray-800 dark:bg-gray-950 dark:text-white"
        >{{ $t('ui.brands') }}</span
      >
    </div>

    <div v-if="brands?.length">
      <div
        class="grid grid-cols-4 gap-x-2 gap-y-4 @sm:grid-cols-5 @md:grid-cols-6 @lg:grid-cols-7 @xl:grid-cols-8 @2xl:grid-cols-9 @3xl:grid-cols-10 @4xl:grid-cols-12"
      >
        <nuxt-link
          v-for="(brand, index) in brands"
          :key="index"
          :to="localePath(`/brands/${brand.slug}`)"
        >
          <div
            class="flex flex-col items-center gap-1 overflow-hidden text-center transition hover:scale-110 active:scale-98"
            v-tippy="
              brand.brand_name
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase())
            "
          >
            <Avatar
              :model="{ name: brand.brand_name, profile_image: brand.brand_logo }"
              class="size-full border border-gray-200 bg-white dark:border-gray-800"
              :colorful="false"
            />

            <span class="line-clamp-1 text-xs tracking-tight">{{
              brand.brand_name
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase())
            }}</span>
          </div>
        </nuxt-link>
      </div>

      <div class="mt-8 flex justify-center">
        <nuxt-link
          :to="localePath('/brands')"
          class="flex items-center justify-center gap-1.5 rounded-full bg-gray-100 p-4 text-sm font-medium tracking-tight text-black transition hover:bg-gray-200 active:scale-98 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
        >
          <IconGrid class="h-4" />
          <span>{{ $t('ui.viewAllBrands') }}</span>
        </nuxt-link>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center text-center xl:px-4"
    >
      <span
        class="text-primary text-xl font-semibold tracking-tight text-balance"
        >{{ $t('brands.comingSoon') }}
      </span>
    </div>
  </div>
</template>

<script setup>
const localePath = useLocalePath();
const config = useRuntimeConfig();

const {
  data: brands,
  refresh,
  pending,
  error,
} = await useFetch("/api/exhibitors", {
  transform: (res) => res.data,
});
</script>
