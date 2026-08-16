<template>
  <div class="space-y-3">
    <address class="text-sm tracking-tight not-italic">
      <span v-if="location.address.line1">{{ location.address.line1 }}<br /></span>
      <span v-if="location.address.village">{{ location.address.village }}, </span>
      {{ location.address.district }}<br />
      {{ location.address.regency }}, {{ location.address.province }}
      <span v-if="location.address.postalCode"> {{ location.address.postalCode }}</span>
    </address>

    <!-- No coordinates yet for a newly opened branch. Better to say so than to
         drop a pin in roughly the right place. -->
    <p v-if="!embedSrc" class="text-muted-foreground text-sm tracking-tight text-pretty">
      Titik lokasi persisnya kami kirim lewat WhatsApp saat kamu pesan, lengkap dengan patokan
      jalan masuknya.
    </p>

    <div v-else class="border-border overflow-hidden rounded-xl border">
      <iframe
        :src="embedSrc"
        :title="`Peta lokasi ${location.name}`"
        width="100%"
        height="320"
        style="border: 0"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen
      />
    </div>

    <Button v-if="location.googleMapsUrl" variant="outline" size="sm" :to="location.googleMapsUrl">
      <Icon name="hugeicons:maps" class="size-4 shrink-0" />
      <span>Buka di Google Maps</span>
    </Button>
  </div>
</template>

<script setup lang="ts">
import type { Location } from "~/data/types";

const props = defineProps<{ location: Location }>();

/**
 * Prefer an explicit embed URL; otherwise build one from the coordinates. The
 * coordinate form needs no API key and is what `q=lat,lng&output=embed` is for.
 */
const embedSrc = computed(() => {
  if (props.location.googleMapsEmbedSrc) return props.location.googleMapsEmbedSrc;
  const geo = props.location.geo;
  if (!geo) return "";
  return `https://maps.google.com/maps?q=${geo.lat},${geo.lng}&z=15&output=embed`;
});
</script>
