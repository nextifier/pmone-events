<template>
  <div class="border-border space-y-4 rounded-xl border p-5">
    <div class="space-y-1">
      <p class="tracking-tight">
        <span v-if="price.prefix" class="text-muted-foreground">{{ price.prefix }}&nbsp;</span>
        <span class="text-2xl font-medium tracking-tighter">{{ price.full }}</span>
        <span class="text-muted-foreground text-sm">{{ price.unit }}</span>
      </p>
      <p v-if="pkg.pricing.minPax" class="text-muted-foreground text-sm tracking-tight">
        Minimal {{ pkg.pricing.minPax }} orang
      </p>
    </div>

    <template v-if="booking.bookable">
      <Button
        v-if="booking.whatsappEnabled"
        :to="booking.whatsappUrl"
        size="lg"
        class="w-full"
      >
        <Icon name="hugeicons:whatsapp" class="size-4 shrink-0" />
        <span>Pesan lewat WhatsApp</span>
      </Button>

      <div v-if="booking.ota.length" class="space-y-2">
        <p class="text-muted-foreground text-sm tracking-tight">Atau pesan lewat</p>
        <div class="grid grid-cols-2 gap-2">
          <Button
            v-for="entry in booking.ota"
            :key="entry.provider.slug"
            :to="entry.url"
            variant="outline"
            size="sm"
          >
            <span>{{ entry.provider.name }}</span>
            <Icon :name="entry.provider.icon" class="size-3.5 shrink-0" />
          </Button>
        </div>
      </div>
    </template>

    <div v-else class="bg-muted space-y-2 rounded-lg p-4">
      <p class="text-sm font-medium tracking-tight">Lagi tidak tersedia</p>
      <p class="text-muted-foreground text-sm tracking-tight text-pretty">
        {{ pkg.statusNote ?? "Paket ini sementara ditutup. Mampir lagi nanti, ya." }}
      </p>
      <Button
        v-if="booking.whatsappEnabled"
        :to="booking.whatsappUrl"
        variant="outline"
        size="sm"
        class="w-full"
      >
        Tanya jadwal bukanya
      </Button>
    </div>

    <p
      v-if="booking.onlineBooking"
      class="text-muted-foreground border-border border-t pt-3 text-xs tracking-tight sm:text-sm"
    >
      {{ booking.onlineBooking.note }}
    </p>
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
