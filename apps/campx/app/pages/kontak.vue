<template>
  <div class="container space-y-12 py-10 lg:py-16">
    <header class="max-w-3xl space-y-3">
      <h1 class="text-4xl font-medium tracking-tighter text-balance sm:text-5xl">
        Kontak &amp; reservasi
      </h1>
      <p class="text-muted-foreground text-base tracking-tight text-pretty sm:text-lg">
        Mau reservasi, tanya paket, atau minta penawaran outing? Paling cepat lewat WhatsApp,
        tapi kalau lebih nyaman menulis panjang, pakai formulir di bawah.
      </p>
    </header>

    <div class="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div class="space-y-8">
        <section v-for="location in locations" :key="location.slug" class="space-y-3">
          <div class="flex items-center gap-x-2.5">
            <Icon
              :name="location.landscape === 'lakeside' ? 'hugeicons:boat' : 'hugeicons:kayak'"
              class="size-5 shrink-0"
            />
            <h2 class="text-base font-medium tracking-tight">{{ location.name }}</h2>
            <Badge v-if="isNew(location)" variant="info" plain>Baru</Badge>
          </div>

          <address class="text-muted-foreground text-sm tracking-tight not-italic">
            <span v-if="location.address.line1">{{ location.address.line1 }}<br /></span>
            <span v-if="location.address.village">{{ location.address.village }}, </span>
            {{ location.address.district }}<br />
            {{ location.address.regency }}, {{ location.address.province }}
            <span v-if="location.address.postalCode"> {{ location.address.postalCode }}</span>
          </address>

          <div class="flex flex-wrap gap-2">
            <Button v-if="location.googleMapsUrl" variant="outline" size="sm" :to="location.googleMapsUrl">
              <Icon name="hugeicons:maps" class="size-4 shrink-0" />
              <span>Buka di Maps</span>
            </Button>
            <Button variant="outline" size="sm" :to="`/${location.slug}`">
              <span>Lihat cabang ini</span>
            </Button>
          </div>

          <p v-if="location.hours?.checkIn" class="text-muted-foreground text-sm tracking-tight">
            Check-in {{ location.hours.checkIn }}, check-out {{ location.hours.checkOut }}.
          </p>
        </section>

        <SocialMedia v-if="hasSocials" />
      </div>

      <ContactForm
        :title="content.title"
        :description="content.description"
        subject="Contact Form"
        compact
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNewLocation, LOCATIONS } from "~/data/locations";

usePageMeta("kontak");

defineOptions({ name: "kontak" });

const content = useContentStore().components.contact;
const locations = LOCATIONS;
const isNew = isNewLocation;

const profile = useProjectProfile();
const hasSocials = computed(() => (profile.socialLinks?.length ?? 0) > 0);
</script>
