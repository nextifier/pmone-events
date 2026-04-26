<template>
  <NuxtLink
    :to="localePath(`${props.brandBasePath}/${props.brand.slug}`)"
    class="group @container flex h-full flex-col gap-4 p-4 sm:p-5"
    :aria-label="props.brand.brand_name"
  >
    <BrandIdentity :brand="props.brand" avatar-size="lg" />

    <div
      v-if="props.showBoothNumber || props.showPromotionImages"
      class="flex items-start justify-center gap-2 @3xs:justify-between"
    >
      <div
        v-if="props.showBoothNumber"
        class="bg-border/50 flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 sm:h-full sm:rounded-2xl"
        v-tippy="props.brand.booth_number"
      >
        <div class="flex items-center gap-1">
          <IconShop class="size-3.5 shrink-0" />
          <span class="line-clamp-1 text-xs tracking-tight">{{
            $t("ui.booth")
          }}</span>
        </div>

        <span class="text-primary line-clamp-1 font-semibold tracking-tight">{{
          props.brand.booth_number || "-"
        }}</span>
      </div>

      <div
        v-if="brand.promotions?.length && props.showPromotionImages"
        class="relative isolate flex flex-col items-center justify-end -space-y-13 @3xs:flex-row @3xs:space-y-0 @3xs:-space-x-5"
      >
        <div
          v-for="(item, index) in brand.promotions.slice(0, 2)"
          :key="index"
          class="flex size-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md nth-2:scale-90 @3xs:nth-2:scale-100"
          :class="{
            '@3xs:odd:-rotate-12 @3xs:even:rotate-12':
              brand.promotions.length == 2,
            '@3xs:first:-rotate-12 @3xs:even:-translate-y-2':
              brand.promotions.length > 2,
          }"
          :style="`z-index: ${brand.promotions.length - index}`"
        >
          <img
            v-if="item.sm || item.md"
            :src="item.sm || item.md"
            :alt="item.alt || props.brand.brand_name"
            loading="lazy"
            class="h-full w-full object-cover"
          />
        </div>

        <div
          v-if="brand.promotions.length > 2"
          class="z-0 hidden size-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-gray-200/50 @3xs:flex @3xs:rotate-12 dark:border-transparent dark:bg-gray-800"
        >
          <span class="text-primary text-base"
            >+{{ brand.promotions.length - 2 }}</span
          >
        </div>
      </div>
    </div>

    <div class="mt-auto">
      <div
        v-if="props.showCreatedAt || props.showViewsCount"
        class="w-full"
      >
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            v-if="props.showCreatedAt"
            class="text-muted-foreground line-clamp-1 text-xs tracking-tight"
            v-tippy="
              $dayjs(props.brand.created_at).format('MMMM D, YYYY [at] h:mm A')
            "
          >
            <span class="hidden sm:inline">{{ $t("ui.created") }} </span>
            {{ $dayjs(props.brand.created_at).fromNow() }}
          </span>

          <span
            v-if="props.brand.views_count && props.showViewsCount"
            class="text-muted-foreground line-clamp-1 flex items-center gap-x-0.5 text-xs tracking-tight"
            v-tippy="
              $t('ui.views', props.brand.views_count, {
                n: props.brand.views_count,
              })
            "
          >
            <Icon name="hugeicons:view" class="size-4" />
            <span>{{ props.brand.views_count }}</span>
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  brand: { type: Object, required: true },
  brandBasePath: { type: String, default: "/brands" },
  showCreatedAt: { type: Boolean, default: true },
  showViewsCount: { type: Boolean, default: false },
  showBoothNumber: { type: Boolean, default: true },
  showPromotionImages: { type: Boolean, default: true },
});

const localePath = useLocalePath();
const { $dayjs } = useNuxtApp();
</script>
