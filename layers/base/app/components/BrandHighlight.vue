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
            <div
              class="flex aspect-square w-full shrink-0 grow-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 text-center dark:border-gray-800 dark:hover:bg-white dark:hover:text-black"
            >
              <NuxtImg
                v-if="brand.brand_logo?.sm"
                :src="`${useAppConfig().app.apiUrl}/${brand.brand_logo.sm}`"
                :alt="brand.brand_name"
                class="h-full w-full rounded-full object-contain dark:brightness-90 dark:contrast-200 dark:grayscale dark:invert-[75%] dark:hover:filter-none"
                sizes="150px"
                width="150"
                height="150"
                loading="lazy"
                format="webp"
              />

              <span v-else class="line-clamp-2 text-xs leading-[1.2]!">{{
                brand.brand_name
                  .toLowerCase()
                  .replace(/\b\w/g, (char) => char.toUpperCase())
              }}</span>
            </div>

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
} = await useFetch(`${useAppConfig().app.apiUrl}/api/exhibitors`, {
  query: {
    "filter[is_published]": 1,
    sort: "brand_name",
  },
});
</script>
