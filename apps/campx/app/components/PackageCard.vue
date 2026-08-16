<template>
  <div>
    <NuxtLink
      :to="`/${pkg.locationSlug}/${pkg.slug}`"
      class="focusable bg-muted relative block aspect-4/5 overflow-hidden rounded-3xl"
    >
      <NuxtImg
        v-if="pkg.coverImage"
        :src="pkg.coverImage.src"
        :alt="pkg.coverImage.alt"
        :width="pkg.coverImage.width"
        :height="pkg.coverImage.height"
        format="webp"
        loading="lazy"
        sizes="320px lg:400px"
        class="pointer-events-none h-full w-full object-cover select-none"
      />

      <!-- No photograph yet. A category mark reads as intentional; an unrelated
           stock photo would not. -->
      <div v-else class="text-muted-foreground/40 flex h-full w-full items-center justify-center">
        <Icon :name="placeholderIcon" class="size-12" />
      </div>

      <div class="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <Badge variant="muted" plain class="bg-background/90 backdrop-blur-sm">
          {{ locationName }}
        </Badge>
        <Badge v-if="flag" :variant="flag.variant" plain class="backdrop-blur-sm">
          {{ flag.label }}
        </Badge>
      </div>
    </NuxtLink>

    <div class="mt-4 flex flex-col">
      <NuxtLink
        :to="`/${pkg.locationSlug}/${pkg.slug}`"
        class="text-foreground line-clamp-2 text-lg font-semibold tracking-tighter"
      >
        {{ pkg.title }}
      </NuxtLink>

      <p v-if="pkg.subtitle" class="text-muted-foreground mt-1 line-clamp-2 text-base tracking-tight">
        {{ pkg.subtitle }}
      </p>

      <div v-if="facts.length" class="text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <span v-for="fact in facts" :key="fact.label" class="inline-flex items-center gap-x-1.5 text-base tracking-tight">
          <Icon :name="fact.icon" class="size-4 shrink-0" />
          {{ fact.label }}
        </span>
      </div>

      <p class="text-foreground mt-2 text-base tracking-tight">
        <span v-if="price.prefix" class="text-muted-foreground">{{ price.prefix }}&nbsp;</span>
        <span class="font-semibold">{{ price.compact }}</span>
        <span class="text-muted-foreground">{{ price.unit }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCategory } from "~/data/categories";
import { getLocation } from "~/data/locations";
import type { Package } from "~/data/types";

const props = defineProps<{ pkg: Package }>();

const { headline } = usePriceDisplay();

const price = computed(() => headline(props.pkg.pricing));
const locationName = computed(() => getLocation(props.pkg.locationSlug)?.shortName ?? "");

const placeholderIcon = computed(
  () => getCategory(props.pkg.categorySlugs[0] ?? "")?.icon ?? "hugeicons:tent",
);

/** One flag at most, and availability outranks marketing. */
const flag = computed(() => {
  if (props.pkg.status !== "available") {
    return { label: "Lagi tutup", variant: "warning" as const };
  }
  const badge = props.pkg.badges[0];
  return badge ? { label: badge.label, variant: badge.variant } : null;
});

/**
 * Two facts, picked in the order a buyer asks: how long, then how many people.
 * Anything missing drops out rather than leaving a gap.
 */
const facts = computed(() => {
  const pkg = props.pkg;
  const out: { icon: string; label: string }[] = [];

  if (pkg.duration?.label) {
    out.push({ icon: "hugeicons:clock-01", label: pkg.duration.label });
  }
  if (pkg.distanceKm) {
    out.push({ icon: "hugeicons:route-01", label: `${pkg.distanceKm} km` });
  }
  if (pkg.pricing.minPax) {
    out.push({ icon: "hugeicons:user-group", label: `Min. ${pkg.pricing.minPax} orang` });
  } else if (pkg.capacity?.max) {
    out.push({ icon: "hugeicons:user-group", label: `Maks. ${pkg.capacity.max} orang` });
  }

  return out.slice(0, 2);
});
</script>
