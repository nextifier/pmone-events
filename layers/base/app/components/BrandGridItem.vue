<template>
  <NuxtLink
    :to="to"
    :aria-label="brand.brand_name"
    class="group row-span-4 grid grid-rows-subgrid gap-y-0 overflow-hidden pt-6"
    :class="
      isCard ? 'bg-card text-card-foreground rounded-xl border' : cellClass
    "
  >
    <!-- Avatar (row 1) -->
    <div class="row-start-1 flex justify-center">
      <Avatar
        :model="{
          name: brand.brand_name,
          profile_image: brand.profile_image ?? brand.brand_logo,
        }"
        class="size-16"
        rounded="rounded-full"
        :colorful="false"
        :gradient-frame="hasInstagram(brand)"
      />
    </div>

    <!-- Brand name (row 2) -->
    <p
      class="text-foreground row-start-2 mt-3 line-clamp-2 px-2 text-center leading-tight font-medium tracking-tight text-balance"
    >
      {{ brand.brand_name }}
    </p>

    <!-- Categories (row 3) -->
    <p
      v-if="brand.business_categories?.length"
      class="text-muted-foreground row-start-3 mt-1 line-clamp-2 px-2 text-center text-xs tracking-tight sm:text-sm"
    >
      {{ brand.business_categories.join(", ") }}
    </p>

    <!-- Booth + first promotion (row 4) -->
    <div class="row-start-4 mt-4 grid w-full grid-cols-2 gap-x-2">
      <div
        class="bg-muted mb-1 ml-1 flex max-w-full flex-col items-center justify-center gap-y-0.5 justify-self-start rounded-lg px-2.5 py-1.5"
      >
        <div class="flex items-center gap-x-1">
          <span class="line-clamp-1 text-xs tracking-tight"
            >{{ $t("ui.booth") }} #</span
          >
        </div>
        <span
          class="text-foreground no-scrollbar scroll-fade-x flex w-full flex-nowrap justify-center-safe overflow-auto leading-none font-semibold tracking-tight whitespace-nowrap"
          >{{ brand.booth_number || "-" }}</span
        >
      </div>

      <div
        v-if="firstPromo && (firstPromo.sm || firstPromo.md)"
        role="button"
        :aria-label="`Lihat promosi ${brand.brand_name}`"
        class="bg-muted relative isolate h-14 w-full shrink-0 cursor-zoom-in overflow-hidden rounded-tl-xl after:pointer-events-none after:absolute after:inset-0 after:rounded-tl-xl after:shadow-[inset_-6px_-6px_12px_-4px_rgba(0,0,0,0.35)] after:content-['']"
        @click.stop.prevent="openPromo?.(brand.slug)"
      >
        <img
          :src="firstPromo.sm || firstPromo.md"
          :alt="firstPromo.alt || brand.brand_name"
          loading="lazy"
          class="outline-inside absolute inset-0 size-full object-cover object-top-left"
        />
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
import { computed, inject } from "vue";
import { hasInstagram } from "../composables/useBrandHelpers";

const props = defineProps({
  brand: { type: Object, required: true },
  brandBasePath: { type: String, default: "/brands" },
  variant: { type: String, default: "grid" }, // 'grid' | 'card'
  // Grid hairline borders (border-l / border-t), supplied by BrandVirtualList.
  cellClass: { type: [String, Array, Object], default: "" },
});

const localePath = useLocalePath();

const to = computed(() =>
  localePath(`${props.brandBasePath}/${props.brand.slug}`),
);
const isCard = computed(() => props.variant === "card");
const firstPromo = computed(() => props.brand.promotions?.[0] || null);

// Opens the shared promo lightbox (provided by BrandVirtualList) at this brand.
const openPromo = inject("brandPromoOpen", null);
</script>
