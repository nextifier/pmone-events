<template>
  <div v-if="location" class="pb-16">
    <!-- Hero -->
    <section class="relative">
      <div class="relative h-[62vh] min-h-[420px] w-full overflow-hidden sm:h-[70vh]">
        <NuxtImg
          :src="location.heroMedia.src"
          :alt="location.heroMedia.alt"
          :width="location.heroMedia.width"
          :height="location.heroMedia.height"
          format="webp"
          preload
          sizes="100vw"
          class="size-full object-cover"
        />
        <!-- style-guide: Teks di atas warna arbitrer user. Putih di atas foto,
             rasio kontrasnya dijaga .photo-scrim. -->
        <div class="photo-scrim" />

        <div class="absolute inset-x-0 bottom-0">
          <div class="container space-y-4 pb-10">
            <div class="flex flex-wrap items-center gap-2">
              <Badge variant="muted" plain>{{ location.address.regency }}</Badge>
              <Badge v-if="isNewLocation(location)" variant="info" plain>Baru dibuka</Badge>
            </div>

            <h1 class="max-w-3xl text-4xl font-medium tracking-tighter text-balance text-white sm:text-5xl">
              {{ location.seo.title }}
            </h1>

            <p class="max-w-2xl text-base tracking-tight text-pretty text-white/85 sm:text-lg">
              {{ location.description }}
            </p>

            <div class="flex flex-wrap gap-3 pt-2">
              <Button v-if="booking.whatsappEnabled" :to="booking.whatsappUrl" size="lg">
                <Icon name="hugeicons:whatsapp" class="size-4 shrink-0" />
                <span>Reservasi</span>
              </Button>
              <Button variant="secondary" size="lg" :to="`/paket?lokasi=${location.slug}`">
                Lihat semua paket
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <dl
          class="border-border grid grid-cols-2 gap-x-6 gap-y-5 border-b py-6 sm:grid-cols-4"
        >
          <div v-for="fact in facts" :key="fact.label" class="space-y-0.5">
            <dt class="text-muted-foreground text-sm tracking-tight">{{ fact.label }}</dt>
            <dd class="text-base font-medium tracking-tight">{{ fact.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <div class="container space-y-16 pt-12 lg:space-y-24 lg:pt-16">
      <!-- Story + highlights -->
      <section class="grid gap-10 lg:grid-cols-[3fr_2fr] lg:gap-16">
        <div class="typeset max-w-none" v-html="location.story" />

        <aside v-if="location.highlights.length" class="space-y-4">
          <h2 class="text-base font-medium tracking-tight">Yang bikin beda di sini</h2>
          <ul class="space-y-3">
            <li
              v-for="highlight in location.highlights"
              :key="highlight"
              class="flex gap-x-2.5 text-sm tracking-tight text-pretty"
            >
              <Icon name="hugeicons:tick-02" class="text-brand mt-0.5 size-4 shrink-0" />
              {{ highlight }}
            </li>
          </ul>
        </aside>
      </section>

      <!-- Packages, grouped so the page answers "what can I book" in one screen -->
      <section v-for="group in packageGroups" :key="group.id" :id="group.id" class="space-y-6 scroll-mt-navbar">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="max-w-2xl space-y-2">
            <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">{{ group.title }}</h2>
            <p class="text-muted-foreground text-sm tracking-tight text-pretty sm:text-base">
              {{ group.description }}
            </p>
          </div>
          <Button variant="outline" size="sm" :to="group.moreHref">Lihat semua</Button>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <PackageCard v-for="pkg in group.packages" :key="pkg.id" :pkg="pkg" />
        </div>
      </section>

      <!-- Facilities -->
      <section class="space-y-6">
        <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Fasilitas</h2>
        <FacilityGrid :slugs="location.facilitySlugs" />

        <!-- Only rendered where the numbers are published. A branch without a
             venue guide simply does not show this block. -->
        <div v-if="capacityRows.length" class="border-border divide-border divide-y rounded-xl border">
          <div
            v-for="row in capacityRows"
            :key="row.label"
            class="flex items-baseline justify-between gap-4 px-4 py-3"
          >
            <p class="text-sm tracking-tight">{{ row.label }}</p>
            <p class="shrink-0 text-sm font-medium tracking-tight tabular-nums">{{ row.value }}</p>
          </div>
          <p
            v-if="location.capacity?.note"
            class="text-muted-foreground px-4 py-3 text-sm tracking-tight text-pretty"
          >
            {{ location.capacity.note }}
          </p>
        </div>
      </section>

      <!-- Zones + site map -->
      <section v-if="location.zones.length" class="space-y-6">
        <div class="max-w-2xl space-y-2">
          <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Area di dalam</h2>
          <p class="text-muted-foreground text-sm tracking-tight text-pretty sm:text-base">
            Sepuluh titik yang perlu kamu tahu sebelum datang.
          </p>
        </div>

        <ol class="divide-border border-border divide-y rounded-xl border">
          <li
            v-for="(zone, index) in location.zones"
            :key="zone.slug"
            class="flex items-start gap-4 px-4 py-3"
          >
            <span class="text-muted-foreground w-5 shrink-0 pt-0.5 text-sm tabular-nums">
              {{ index + 1 }}
            </span>
            <Icon :name="zone.icon" class="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium tracking-tight">{{ zone.name }}</p>
              <p v-if="zone.description" class="text-muted-foreground text-sm tracking-tight text-pretty">
                {{ zone.description }}
              </p>
            </div>
          </li>
        </ol>

        <Lightbox v-if="location.siteMapImage" :items="siteMapItems" show-counter>
          <template #trigger="{ openAt }">
            <button
              type="button"
              class="focusable border-border bg-muted block w-full overflow-hidden rounded-xl border"
              :aria-label="`Buka denah ${location.name}`"
              @click="openAt(0)"
            >
              <NuxtImg
                :src="location.siteMapImage.src"
                :alt="location.siteMapImage.alt"
                :width="location.siteMapImage.width"
                :height="location.siteMapImage.height"
                format="webp"
                loading="lazy"
                sizes="100vw lg:1000px"
                class="w-full object-contain"
              />
            </button>
          </template>
        </Lightbox>

        <div v-if="location.files.length" class="flex flex-wrap gap-2">
          <Button
            v-for="file in location.files"
            :key="file.href"
            variant="outline"
            size="sm"
            :to="file.href"
            target="_blank"
          >
            <Icon :name="file.icon" class="size-4 shrink-0" />
            <span>{{ file.label }}</span>
          </Button>
        </div>
      </section>

      <!-- Gallery -->
      <section v-if="location.gallery.length" class="space-y-6">
        <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Suasananya</h2>
        <Lightbox :items="galleryItems" show-thumbnails show-counter show-caption>
          <template #trigger="{ openAt }">
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              <button
                v-for="(media, index) in location.gallery"
                :key="media.src"
                type="button"
                :aria-label="`Buka foto: ${media.alt}`"
                class="focusable bg-muted aspect-4/5 overflow-hidden rounded-lg"
                @click="openAt(index)"
              >
                <NuxtImg
                  :src="media.src"
                  :alt="media.alt"
                  :width="media.width"
                  :height="media.height"
                  format="webp"
                  loading="lazy"
                  sizes="200px sm:260px lg:320px"
                  class="size-full object-cover"
                />
              </button>
            </div>
          </template>
        </Lightbox>
      </section>

      <!-- Getting there -->
      <section class="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div class="space-y-5">
          <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Cara ke sini</h2>

          <ul v-if="location.routes.length" class="divide-border border-border divide-y rounded-xl border">
            <li v-for="route in location.routes" :key="route.from" class="space-y-1 px-4 py-3">
              <div class="flex items-baseline justify-between gap-4">
                <p class="text-sm font-medium tracking-tight">Dari {{ route.from }}</p>
                <p class="text-muted-foreground shrink-0 text-sm tracking-tight tabular-nums">
                  ±{{ Math.round(route.durationMinutes / 60 * 10) / 10 }} jam
                  <span v-if="route.distanceKm">· {{ route.distanceKm }} km</span>
                </p>
              </div>
              <p class="text-muted-foreground text-sm tracking-tight text-pretty">
                {{ route.via }}<span v-if="route.note">. {{ route.note }}</span>
              </p>
            </li>
          </ul>

          <div v-if="location.nearby.length" class="space-y-3">
            <h3 class="text-base font-medium tracking-tight">Sekitar sini</h3>
            <ul class="space-y-2">
              <li
                v-for="place in location.nearby"
                :key="place.name"
                class="text-sm tracking-tight text-pretty"
              >
                <span class="font-medium">{{ place.name }}</span>
                <span v-if="place.distanceKm !== null" class="text-muted-foreground">
                  · {{ place.distanceKm }} km</span
                >
                <span class="text-muted-foreground">, {{ place.description }}</span>
              </li>
            </ul>
          </div>
        </div>

        <MapEmbed :location="location" />
      </section>

      <!-- FAQ -->
      <section v-if="locationFaqs.length" class="max-w-3xl space-y-5">
        <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">
          Soal CampX {{ location.shortName }}
        </h2>
        <Accordion type="single" collapsible class="w-full">
          <AccordionItem v-for="faq in locationFaqs" :key="faq.id" :value="faq.id">
            <AccordionTrigger class="text-left">{{ faq.question }}</AccordionTrigger>
            <AccordionContent>
              <div class="typeset typeset-cms" v-html="faq.answer" />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <!-- The other branch -->
      <section v-if="siblings.length" class="space-y-6">
        <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Cabang satunya</h2>
        <article
          v-for="sibling in siblings"
          :key="sibling.slug"
          class="border-border grid gap-6 overflow-hidden rounded-xl border sm:grid-cols-2"
        >
          <NuxtImg
            :src="sibling.heroMedia.src"
            :alt="sibling.heroMedia.alt"
            :width="sibling.heroMedia.width"
            :height="sibling.heroMedia.height"
            format="webp"
            loading="lazy"
            sizes="100vw sm:400px"
            class="aspect-16/10 size-full object-cover"
          />
          <div class="space-y-3 p-5 sm:py-8">
            <h3 class="text-lg font-medium tracking-tighter">{{ sibling.name }}</h3>
            <p class="text-muted-foreground text-sm tracking-tight text-pretty">
              {{ sibling.description }}
            </p>
            <Button variant="outline" size="sm" :to="`/${sibling.slug}`">
              <span>Lihat {{ sibling.shortName }}</span>
              <Icon name="hugeicons:arrow-right-01" class="size-4 shrink-0" />
            </Button>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { faqsFor } from "~/data/faqs";
import { getLocation, isLocationSlug, isNewLocation, otherLocations } from "~/data/locations";
import { lowestPriceAt, packagesByLocation } from "~/data/packages";
import type { LocationSlug, Package } from "~/data/types";

definePageMeta({
  // Synchronous and pure. `validate` runs before setup, so an unknown branch
  // gets a real 404 instead of a page that renders nothing.
  validate: (route) => isLocationSlug(String(route.params.location)),
});

defineOptions({ name: "location" });

const route = useRoute();
const slug = computed(() => String(route.params.location) as LocationSlug);
const location = computed(() => getLocation(slug.value));

const { formatCompact } = usePriceDisplay();
const { forLocation } = useBooking();

const booking = computed(() =>
  location.value
    ? forLocation(location.value)
    : { whatsappEnabled: false, whatsappUrl: "", ota: [], onlineBooking: null },
);

const siblings = computed(() => (location.value ? otherLocations(location.value.slug) : []));
const locationFaqs = computed(() => faqsFor("location", { locationSlug: slug.value }));

const packages = computed(() => packagesByLocation(slug.value));

const pick = (types: Package["type"][]) =>
  packages.value.filter((pkg) => types.includes(pkg.type));

/**
 * Rafting gets its own block at Cikidang because it is the reason people come,
 * and burying five routes inside a generic "activities" grid would hide it.
 */
const packageGroups = computed(() => {
  const raftingPackages = packages.value.filter((pkg) => pkg.categorySlugs.includes("rafting"));
  const otherActivities = pick(["activity"]).filter(
    (pkg) => !pkg.categorySlugs.includes("rafting"),
  );

  return [
    {
      id: "menginap",
      title: "Menginap",
      description: "Tenda, lahan camping, atau cabin. Pilih seberapa repot yang kamu mau.",
      packages: pick(["stay"]),
      moreHref: `/paket?lokasi=${slug.value}&tipe=stay`,
    },
    {
      id: "rafting",
      title: "Arung jeram",
      description: "Lima jalur dengan panjang dan durasi berbeda, semua sudah termasuk pemandu.",
      packages: raftingPackages,
      moreHref: `/paket?lokasi=${slug.value}&kategori=rafting`,
    },
    {
      id: "aktivitas",
      title: "Aktivitas",
      description: "Yang bisa dilakukan tanpa harus menginap.",
      packages: otherActivities,
      moreHref: `/paket?lokasi=${slug.value}&tipe=activity`,
    },
    {
      id: "outing",
      title: "Day trip & outing",
      description: "Rangkaian sehari penuh, sendiri atau bersama rombongan kantor.",
      packages: pick(["trip", "outing", "pass"]),
      moreHref: `/paket?lokasi=${slug.value}&tipe=outing`,
    },
  ].filter((group) => group.packages.length > 0);
});

const facts = computed(() => {
  const current = location.value;
  if (!current) return [];

  const out: { label: string; value: string }[] = [];
  const cheapest = lowestPriceAt(current.slug);

  if (cheapest) out.push({ label: "Mulai dari", value: formatCompact(cheapest) });
  if (current.distanceFromJakarta) {
    out.push({ label: "Dari Jakarta", value: current.distanceFromJakarta.label });
  }
  if (current.hours?.checkIn) {
    out.push({ label: "Check-in", value: `${current.hours.checkIn} / ${current.hours.checkOut}` });
  }
  out.push({ label: "Paket tersedia", value: `${packages.value.length}` });

  return out;
});

/** Published venue numbers, as rows. Absent fields simply drop out. */
const capacityRows = computed(() => {
  const capacity = location.value?.capacity;
  if (!capacity) return [];

  const withSize = (count: number, size: string | null, unit: string) =>
    size ? `${count} ${unit} (${size})` : `${count} ${unit}`;

  const rows: { label: string; value: string }[] = [];

  if (capacity.campsite) {
    rows.push({
      label: "Kavling camping",
      value: withSize(capacity.campsite, capacity.campsiteSize, "kavling"),
    });
  }
  if (capacity.cabin) {
    rows.push({ label: "Cabin", value: withSize(capacity.cabin, capacity.cabinSize, "unit") });
  }
  if (capacity.camperVan) {
    rows.push({
      label: "Lahan camper van",
      value: withSize(capacity.camperVan, capacity.camperVanSize, "unit"),
    });
  }
  if (capacity.amphitheatre) {
    rows.push({ label: "Open stage amfiteater", value: `${capacity.amphitheatre} orang` });
  }

  return rows;
});

const galleryItems = computed(() =>
  (location.value?.gallery ?? []).map((media) => ({
    url: media.src,
    sm: media.src,
    alt: media.alt,
    caption: media.caption ?? media.alt,
  })),
);

const siteMapItems = computed(() => {
  const media = location.value?.siteMapImage;
  return media ? [{ url: media.src, sm: media.src, alt: media.alt, caption: media.alt }] : [];
});

// Just the branch line. `usePageMeta` appends " · CampX Holiday Park" from the
// title template, and adding "CampX {shortName}" here on top of that produced
// "… · CampX Cikidang · CampX Holiday Park" — 76 characters saying the brand
// twice, which SERP would have truncated anyway.
usePageMeta(null, {
  title: computed(() => location.value?.seo.title ?? ""),
  description: computed(() => location.value?.seo.description ?? ""),
});

/**
 * Campground + breadcrumbs + the branch's catalog.
 *
 * No FAQPage here even though the questions are rendered above: the same set is
 * marked up on /faq, and duplicating it across pages is what gets FAQ rich
 * results filtered.
 */
const { buildCampground, buildBreadcrumbList, buildItemList, emit } = useJsonLd();

emit([
  location.value ? buildCampground(location.value) : null,
  location.value
    ? buildBreadcrumbList([
        { label: "Beranda", to: "/" },
        { label: location.value.name, to: `/${location.value.slug}` },
      ])
    : null,
  location.value
    ? buildItemList(packages.value, `Paket di CampX ${location.value.shortName}`)
    : null,
]);
</script>
