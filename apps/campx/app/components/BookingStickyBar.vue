<template>
  <div
    class="border-border bg-background/95 supports-backdrop-filter:bg-background/85 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-sm lg:hidden"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <div class="container flex items-center gap-3 py-3">
      <div class="min-w-0 flex-1">
        <p class="truncate tracking-tight">
          <span v-if="price.prefix" class="text-muted-foreground">{{ price.prefix }}&nbsp;</span>
          <span class="font-medium">{{ price.compact }}</span>
          <span class="text-muted-foreground text-sm">{{ price.unit }}</span>
        </p>
        <p v-if="pkg.pricing.minPax" class="text-muted-foreground truncate text-xs tracking-tight">
          Minimal {{ pkg.pricing.minPax }} orang
        </p>
      </div>

      <Button
        v-if="booking.bookable && booking.whatsappEnabled"
        :to="booking.whatsappUrl"
        size="lg"
        class="shrink-0"
      >
        <Icon name="hugeicons:whatsapp" class="size-4 shrink-0" />
        <span>Pesan</span>
      </Button>

      <Button
        v-else-if="booking.whatsappEnabled"
        :to="booking.whatsappUrl"
        variant="outline"
        size="lg"
        class="shrink-0"
      >
        Tanya jadwal
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Package } from "~/data/types";

const props = defineProps<{ pkg: Package }>();

const { headline } = usePriceDisplay();
const { forPackage } = useBooking();

const price = computed(() => headline(props.pkg.pricing));
const booking = computed(() => forPackage(props.pkg));
</script>
