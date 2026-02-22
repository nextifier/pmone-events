<template>
  <div v-if="brand" class="pt-6 sm:pb-14 lg:pt-8 lg:pb-20">
    <div class="container flex items-center justify-between">
      <BackButton />

      <DialogShare :pageTitle="title" />
    </div>

    <div class="container mt-6 lg:mt-12">
      <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div class="flex flex-col items-center gap-6 xl:items-start">
          <div class="flex flex-col items-center gap-6 xl:flex-row">
            <nuxt-link
              :to="
                brand.instagram
                  ? `https://www.instagram.com/${brand.instagram}`
                  : ''
              "
              target="_blank"
              class="flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-full p-[3px] text-center [view-transition-name:brand-avatar] xl:size-32"
              :class="
                brand.instagram ? 'gradient-insta bg-linear-to-tr' : 'bg-border'
              "
            >
              <NuxtImg
                v-if="brand.brand_logo?.sm"
                :src="`${useAppConfig().app.apiUrl}/${brand.brand_logo.sm}`"
                sizes="150px"
                :alt="brand.brand_name"
                class="h-full w-full rounded-full border-[3px] border-white bg-white object-contain dark:border-gray-950"
                width="150"
                height="150"
                loading="lazy"
                format="webp"
              />

              <span
                v-else
                class="line-clamp-2 flex h-full w-full items-center justify-center rounded-full border-[3px] border-white bg-white text-lg leading-[1.2]! text-black dark:border-gray-950"
                >{{ brand.brand_name }}</span
              >
            </nuxt-link>

            <div
              class="flex flex-col items-center gap-y-2 text-center xl:items-start xl:text-left"
            >
              <h1
                class="text-3xl leading-[1.2]! font-semibold tracking-tight text-black xl:text-3xl dark:text-white"
              >
                {{ brand.brand_name }}
              </h1>

              <span v-if="brand.company_name" class="text-xs sm:text-sm">{{
                brand.company_name
              }}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <SocialLink
              v-if="brand.website"
              :to="`https://${brand.website}`"
              iconName="hugeicons:globe-02"
              label="Website"
            />
            <SocialLink
              v-if="brand.instagram"
              :to="`https://www.instagram.com/${brand.instagram}`"
              iconName="hugeicons:instagram"
              label="Instagram"
            />
            <SocialLink
              v-if="brand.facebook"
              :to="`https://www.facebook.com/${brand.facebook}`"
              iconName="hugeicons:facebook-01"
              label="Facebook"
            />
            <SocialLink
              v-if="brand.linkedin"
              :to="`https://www.linkedin.com/company/${brand.linkedin}`"
              iconName="hugeicons:linkedin-01"
              label="LinkedIn"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 xl:order-last">
          <div
            class="flex flex-col gap-y-2 rounded-3xl bg-indigo-600 px-4 py-6 text-white lg:px-6 lg:py-8"
          >
            <div class="flex items-center gap-x-1">
              <IconShop class="size-5 shrink-0" />
              <span class="tracking-tight">Booth</span>
            </div>

            <div class="text-2xl font-semibold tracking-tight">
              {{ brand.booth_number || "-" }}
            </div>
          </div>

          <div
            class="flex flex-col gap-y-2 rounded-3xl bg-lime-300 px-4 py-6 text-black lg:px-6 lg:py-8"
          >
            <div class="flex items-center gap-x-1">
              <IconTag class="size-5 shrink-0" />
              <span class="tracking-tight">Categories</span>
            </div>

            <div class="text-base font-semibold tracking-tight">
              <span v-if="brand.business_categories.length">{{
                brand.business_categories.join(", ")
              }}</span>
              <span v-else>-</span>
            </div>
          </div>
        </div>

        <div
          v-if="brand.brand_description"
          class="flex flex-col gap-y-2 rounded-3xl bg-gray-100 px-4 py-6 lg:px-6 lg:py-8 dark:bg-gray-900"
        >
          <span class="tracking-tight text-gray-500 dark:text-gray-400"
            >Description</span
          >
          <p class="text-base tracking-tight sm:text-lg">
            {{ brand.brand_description }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-6 sm:container lg:mt-10">
      <div
        v-if="brand.promotions?.length"
        class="grid grid-cols-1 gap-x-4 sm:grid-cols-2 sm:gap-y-4 xl:grid-cols-3"
      >
        <div v-for="(promo, index) in brand.promotions" :key="index">
          <div
            class="overflow-hidden bg-gray-100 sm:rounded-2xl dark:bg-gray-900"
          >
            <NuxtImg
              :src="`${useAppConfig().app.apiUrl}/${promo.image?.xl}`"
              alt=""
              class="h-full w-full object-contain"
              sizes="800px"
              loading="lazy"
              format="webp"
            />
          </div>

          <div
            class="flex items-start gap-x-2.5 pt-3 pr-4 pb-8 pl-2 sm:px-0 sm:pt-4"
          >
            <nuxt-link
              :to="
                brand.instagram
                  ? `https://www.instagram.com/${brand.instagram}`
                  : ''
              "
              target="_blank"
              class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full p-0.5 text-center"
              :class="
                brand.instagram ? 'gradient-insta bg-linear-to-tr' : 'bg-border'
              "
            >
              <NuxtImg
                v-if="brand.brand_logo?.sm"
                :src="`${useAppConfig().app.apiUrl}/${brand.brand_logo.sm}`"
                sizes="150px"
                :alt="brand.brand_name"
                class="h-full w-full rounded-full border-2 border-white bg-white object-contain dark:border-gray-950"
                width="150"
                height="150"
                loading="lazy"
                format="webp"
              />

              <span
                v-else
                class="line-clamp-2 flex h-full w-full items-center justify-center rounded-full border-[3px] border-white bg-white text-[10px] leading-[1.2]! text-black dark:border-gray-950"
                >{{ brand.brand_name }}</span
              >
            </nuxt-link>

            <div class="text-primary flex flex-col gap-y-1 pt-1.5">
              <nuxt-link
                :to="
                  brand.instagram
                    ? `https://www.instagram.com/${brand.instagram}`
                    : ''
                "
                target="_blank"
                class="font-semibold tracking-tight"
                >{{ brand.instagram ?? brand.brand_name }}</nuxt-link
              >

              <div v-if="promo.caption" class="tracking-tight">
                {{ promo.caption }}
              </div>

              <span
                class="text-xs tracking-tight text-gray-500 dark:text-gray-400"
              >
                {{ $dayjs(promo.created_at).fromNow() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const config = useRuntimeConfig();

const { $dayjs } = useNuxtApp();

const { data: brand } = await useFetch(
  `${useAppConfig().app.apiUrl}/api/exhibitors/${route.params.slug}`,
);

if (!brand.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
  });
}

const title = ref(brand?.value?.brand_name) ?? "";
const description = brand?.value?.brand_description ?? "";

usePageMeta("", {
  title: title,
  description: description,
});

const router = useRouter();
defineShortcuts({
  escape: {
    handler: async () => {
      router.back();
    },
  },
});
</script>
