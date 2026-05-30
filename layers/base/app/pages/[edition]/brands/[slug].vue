<template>
  <div v-if="brand" class="pt-6 sm:pb-14 lg:pt-8 lg:pb-20">
    <div class="container flex items-center justify-between">
      <ButtonBack />

      <DialogShare :pageTitle="title" />
    </div>

    <div class="container mt-6 lg:mt-12">
      <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div class="flex flex-col items-center gap-6 xl:items-start">
          <div class="flex flex-col items-center gap-6 xl:flex-row">
            <nuxt-link
              :to="instagramLink?.url || ''"
              target="_blank"
              class="flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-full p-[3px] text-center [view-transition-name:brand-avatar] xl:size-32"
              :class="
                instagramLink ? 'gradient-insta bg-linear-to-tr' : 'bg-border'
              "
            >
              <Avatar
                :model="{
                  name: brand.brand_name,
                  profile_image: brand.brand_logo,
                }"
                class="size-full border-[3px] border-white bg-white dark:border-gray-950"
                size="md"
                :colorful="false"
              />
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

          <div v-if="brand.links?.length" class="flex gap-2">
            <SocialLink
              v-for="link in brand.links"
              :key="link.label"
              :to="link.url"
              :iconName="getLinkIcon(link.label)"
              :label="link.label"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 xl:order-last">
          <div
            class="flex flex-col gap-y-2 rounded-3xl bg-indigo-600 px-4 py-6 text-white lg:px-6 lg:py-8"
          >
            <div class="flex items-center gap-x-1">
              <IconShop class="size-5 shrink-0" />
              <span class="tracking-tight">{{ $t("ui.booth") }}</span>
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
              <span class="tracking-tight">{{ $t("ui.categories") }}</span>
            </div>

            <div class="text-base font-semibold tracking-tight">
              <span v-if="brand.business_categories?.length">{{
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
          <span class="tracking-tight text-gray-500 dark:text-gray-400">{{
            $t("ui.description")
          }}</span>
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
        <div v-for="(promo, promoIndex) in brand.promotions" :key="promoIndex">
          <div
            v-for="(image, imgIndex) in promo.images"
            :key="`${promoIndex}-${imgIndex}`"
          >
            <div
              class="overflow-hidden bg-gray-100 sm:rounded-2xl dark:bg-gray-900"
            >
              <img
                :src="image.xl"
                :alt="image.alt || ''"
                class="h-full w-full object-contain"
                loading="lazy"
              />
            </div>

            <div
              class="flex items-start gap-x-2.5 pt-3 pr-4 pb-8 pl-2 sm:px-0 sm:pt-4"
            >
              <nuxt-link
                :to="instagramLink?.url || ''"
                target="_blank"
                class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full p-0.5 text-center"
                :class="
                  instagramLink ? 'gradient-insta bg-linear-to-tr' : 'bg-border'
                "
              >
                <Avatar
                  :model="{
                    name: brand.brand_name,
                    profile_image: brand.brand_logo,
                  }"
                  class="size-full border-2 border-white bg-white dark:border-gray-950"
                  :colorful="false"
                />
              </nuxt-link>

              <div class="text-primary flex flex-col gap-y-1 pt-1.5">
                <nuxt-link
                  :to="instagramLink?.url || ''"
                  target="_blank"
                  class="font-semibold tracking-tight"
                  >{{ instagramUsername ?? brand.brand_name }}</nuxt-link
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
  </div>
</template>

<script setup>
const route = useRoute();
const { $dayjs } = useNuxtApp();

const edition = route.params.edition;

const { data: brand } = await useFetch(
  `/api/exhibitors/by-edition/${edition}/${route.params.slug}`,
  {
    transform: (res) => res.data,
  },
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

const linkIconMap = {
  website: "hugeicons:globe-02",
  instagram: "hugeicons:instagram",
  facebook: "hugeicons:facebook-01",
  tiktok: "hugeicons:tiktok",
  x: "hugeicons:new-twitter",
  twitter: "hugeicons:new-twitter",
  linkedin: "hugeicons:linkedin-01",
  youtube: "hugeicons:youtube",
  threads: "hugeicons:threads",
};

const getLinkIcon = (label) => {
  const key = label?.toLowerCase();
  return linkIconMap[key] || "hugeicons:link-01";
};

const instagramLink = computed(() =>
  brand.value?.links?.find((l) => l.label?.toLowerCase() === "instagram"),
);

const instagramUsername = computed(() => {
  if (!instagramLink.value) return null;
  const path = new URL(instagramLink.value.url).pathname.replace(/\//g, "");
  return path || null;
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
