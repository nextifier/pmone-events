<template>
  <section id="brand-preview" class="container mx-auto">
    <div class="flex flex-col items-center text-center">
      <h2 class="section-title">{{ content.title }}</h2>
    </div>

    <div v-if="pending" class="mt-10 flex justify-center">
      <Skeleton class="h-[22em] w-full max-w-3xl rounded-3xl" />
    </div>

    <div
      v-else-if="!brandsWithLogo.length"
      class="text-muted-foreground mt-10 flex justify-center text-sm tracking-tight"
    >
      {{ $t("brandPreview.empty") }}
    </div>

    <Carousel3d
      v-else
      :items="brandsWithLogo"
      card-width="clamp(13em, 28vw, 17em)"
      card-aspect="1/1"
      :click-to-toggle="false"
      :clip-overflow="false"
      class="[min-height:16em]"
      aria-label="Brand preview carousel"
    >
      <template #item="{ item }">
        <NuxtLink
          :to="localePath(`/brands/${item.slug}`)"
          class="group flex h-full flex-col items-center justify-center gap-3 p-4 text-center"
        >
          <Avatar
            :model="{ name: item.brand_name, profile_image: item.brand_logo }"
            class="size-24 transition-transform duration-300 group-hover:scale-105"
            rounded="rounded-full"
            :colorful="false"
            gradient-frame
          />

          <div class="flex flex-col gap-1">
            <h3
              class="line-clamp-2 text-base font-semibold tracking-tight sm:text-lg"
            >
              {{ item.brand_name }}
            </h3>

            <p
              v-if="primaryCategory(item)"
              class="text-muted-foreground line-clamp-1 text-xs tracking-tight"
            >
              {{ primaryCategory(item) }}
            </p>
          </div>
        </NuxtLink>
      </template>
    </Carousel3d>
  </section>
</template>

<script setup>
const contentStore = useContentStore();
const localePath = useLocalePath();

const content = computed(() => contentStore.components.brandPreview);

const { data, pending } = await useAsyncData("brand-preview", () =>
  $fetch("/api/exhibitors", { query: { per_page: 60 } }).catch(() => null),
);

const brandsWithLogo = computed(() => {
  const list = data.value?.data ?? [];
  return list
    .filter((b) => {
      const logo = b.brand_logo;
      if (!logo) return false;
      if (Array.isArray(logo)) return logo.length > 0;
      if (typeof logo === "object") return Object.keys(logo).length > 0;
      return Boolean(logo);
    })
    .slice(0, 12);
});

const primaryCategory = (b) =>
  Array.isArray(b.business_categories) ? b.business_categories[0] : null;
</script>
