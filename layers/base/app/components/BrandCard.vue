<template>
  <nuxt-link
    :to="`/brands/${props.brand.slug}`"
    class="bg-muted/60 @container relative isolate flex h-full flex-col gap-4 overflow-hidden rounded-3xl p-4 sm:p-5"
    @click.native="active = props.brand.slug"
  >
    <div
      class="flex flex-col items-center gap-2 text-center @3xs:flex-row @3xs:text-left"
    >
      <div
        class="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full p-[3px] text-center @3xs:size-18 @3xs:p-[2px] [&.active]:[view-transition-name:brand-avatar]"
        :class="{
          'gradient-insta bg-linear-to-tr': props.brand.instagram,
          'bg-border': !props.brand.instagram,
          active: active === props.brand.slug,
        }"
      >
        <NuxtImg
          v-if="props.brand.brand_logo?.sm"
          :src="`${useAppConfig().app.apiUrl}${props.brand.brand_logo.sm}`"
          class="border-muted h-full w-full rounded-full border-3 bg-white object-contain"
          sizes="150px"
          :alt="props.brand.brand_name"
          width="150"
          height="150"
          loading="lazy"
        />

        <span
          v-else
          class="border-muted bg-muted text-primary line-clamp-1 flex h-full w-full items-center justify-center rounded-full border-3 text-xs !leading-[1.2] tracking-tight"
          >{{ props.brand.brand_name }}</span
        >
      </div>

      <div class="flex flex-col gap-y-1">
        <div
          class="text-primary line-clamp-1 font-semibold tracking-tight"
          v-tippy="props.brand.brand_name"
        >
          {{ props.brand.brand_name }}
        </div>

        <div
          v-if="props.brand.business_categories?.length"
          class="text-foreground/70 line-clamp-2 text-xs tracking-tight sm:text-sm @3xs:line-clamp-1"
          v-tippy="props.brand.business_categories.join(', ')"
        >
          <span
            v-for="(category, index) in props.brand.business_categories"
            :key="index"
          >
            {{ category
            }}<span v-if="index != props.brand.business_categories.length - 1"
              >,
            </span>
          </span>
        </div>
      </div>
    </div>

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
          <span class="line-clamp-1 text-xs tracking-tight">Booth</span>
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
          class="flex size-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white shadow-md transition hover:scale-110 nth-2:scale-90 @3xs:nth-2:scale-100"
          :class="{
            '@3xs:odd:-rotate-12 @3xs:even:rotate-12':
              brand.promotions.length == 2,
            '@3xs:first:-rotate-12 @3xs:even:-translate-y-2':
              brand.promotions.length > 2,
          }"
          :style="`z-index: ${brand.promotions.length - index}`"
        >
          <NuxtImg
            v-if="item.image?.md"
            :src="`${useAppConfig().app.apiUrl}${item.image.md}`"
            sizes="250px"
            :alt="props.brand.brand_name"
            loading="lazy"
            class="h-full w-full object-cover"
          />
        </div>

        <div
          v-if="brand.promotions.length > 2"
          class="z-0 hidden size-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-gray-200/50 transition @3xs:flex @3xs:rotate-12 dark:border-transparent dark:bg-gray-800 dark:hover:border-white"
        >
          <span class="text-primary text-base"
            >+{{ brand.promotions.length - 2 }}</span
          >
        </div>
      </div>
    </div>

    <div class="mt-auto pt-12 @3xs:pt-8">
      <div
        v-if="props.showCreatedAt || props.showViewsCount"
        class="w-[calc(100%-3.5rem)] @3xs:block"
      >
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            v-if="props.showCreatedAt"
            class="text-muted-foreground line-clamp-1 text-xs tracking-tight"
            v-tippy="
              $dayjs(props.brand.created_at).format('MMMM D, YYYY [at] h:mm A')
            "
          >
            <span class="hidden sm:inline">Created </span>
            {{ $dayjs(props.brand.created_at).fromNow() }}
          </span>

          <span
            v-if="props.brand.views_count && props.showViewsCount"
            class="text-muted-foreground line-clamp-1 flex items-center gap-x-0.5 text-xs tracking-tight"
            v-tippy="`${props.brand.views_count} views`"
          >
            <Icon name="hugeicons:view" class="size-4" />
            <span>{{ props.brand.views_count }}</span>
          </span>
        </div>
      </div>
    </div>

    <InvertedBorderRadius position="bottom-right" />
  </nuxt-link>
</template>

<script setup>
const props = defineProps({
  brand: Object,
  showCreatedAt: {
    type: Boolean,
    default: true,
  },
  showViewsCount: {
    type: Boolean,
    default: false,
  },
  showBoothNumber: {
    type: Boolean,
    default: true,
  },
  showPromotionImages: {
    type: Boolean,
    default: true,
  },
});

const active = useState();

const config = useRuntimeConfig();
const { $dayjs } = useNuxtApp();
</script>
