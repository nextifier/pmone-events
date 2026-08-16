<template>
  <div v-if="pkg && location" class="pb-24 lg:pb-16">
    <div class="container space-y-8 py-6 lg:py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink as-child><NuxtLink to="/">Beranda</NuxtLink></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink as-child>
              <NuxtLink :to="`/${location.slug}`">{{ location.shortName }}</NuxtLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{{ pkg.title }}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PackageGallery :pkg="pkg" />

      <div class="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div class="space-y-10 lg:col-span-7 xl:col-span-8">
          <header class="space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <Badge variant="muted" plain>{{ location.name }}</Badge>
              <Badge
                v-for="category in categories"
                :key="category.slug"
                variant="outline"
                plain
              >
                {{ category.name }}
              </Badge>
              <Badge v-if="pkg.status !== 'available'" variant="warning" plain>
                Lagi tidak tersedia
              </Badge>
              <Badge v-for="badge in pkg.badges" :key="badge.slug" :variant="badge.variant" plain>
                {{ badge.label }}
              </Badge>
            </div>

            <div class="space-y-2">
              <h1 class="text-3xl font-medium tracking-tighter text-balance sm:text-4xl">
                {{ pkg.title }}
              </h1>
              <p v-if="pkg.subtitle" class="text-muted-foreground text-base tracking-tight text-pretty sm:text-lg">
                {{ pkg.subtitle }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-x-2 gap-y-2">
              <DialogShare :page-title="pkg.title" />
            </div>
          </header>

          <dl v-if="quickFacts.length" class="border-border grid grid-cols-2 gap-x-6 gap-y-4 border-y py-5 sm:grid-cols-4">
            <div v-for="fact in quickFacts" :key="fact.label" class="space-y-0.5">
              <dt class="text-muted-foreground flex items-center gap-x-1.5 text-sm tracking-tight">
                <Icon :name="fact.icon" class="size-3.5 shrink-0" />
                {{ fact.label }}
              </dt>
              <dd class="text-sm font-medium tracking-tight">{{ fact.value }}</dd>
            </div>
          </dl>

          <section class="typeset typeset-cms max-w-none" v-html="pkg.description" />

          <section v-if="pkg.included.length || pkg.excluded.length" class="grid gap-8 sm:grid-cols-2">
            <div v-if="pkg.included.length" class="space-y-3">
              <h2 class="text-base font-medium tracking-tight">Sudah termasuk</h2>
              <ul class="space-y-2">
                <li
                  v-for="item in pkg.included"
                  :key="item"
                  class="flex gap-x-2 text-sm tracking-tight text-pretty"
                >
                  <Icon name="hugeicons:tick-02" class="text-brand mt-0.5 size-4 shrink-0" />
                  {{ item }}
                </li>
              </ul>
            </div>

            <div v-if="pkg.excluded.length" class="space-y-3">
              <h2 class="text-base font-medium tracking-tight">Belum termasuk</h2>
              <ul class="space-y-2">
                <li
                  v-for="item in pkg.excluded"
                  :key="item"
                  class="text-muted-foreground flex gap-x-2 text-sm tracking-tight text-pretty"
                >
                  <Icon name="hugeicons:cancel-01" class="mt-0.5 size-4 shrink-0" />
                  {{ item }}
                </li>
              </ul>
            </div>
          </section>

          <section v-if="pkg.itinerary.length" class="space-y-5">
            <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Susunan acara</h2>
            <ItineraryTimeline :days="pkg.itinerary" />
          </section>

          <section class="space-y-5">
            <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Harga</h2>
            <PackagePriceTable :pricing="pkg.pricing" />
          </section>

          <section v-if="thingsToKnow.length" class="space-y-3">
            <h2 class="text-base font-medium tracking-tight">Yang perlu kamu tahu</h2>
            <ul class="space-y-2">
              <li
                v-for="item in thingsToKnow"
                :key="item"
                class="flex gap-x-2 text-sm tracking-tight text-pretty"
              >
                <Icon name="hugeicons:information-circle" class="text-muted-foreground mt-0.5 size-4 shrink-0" />
                {{ item }}
              </li>
            </ul>
          </section>

          <section v-if="pkg.facilitySlugs.length" class="space-y-4">
            <h2 class="text-base font-medium tracking-tight">Fasilitas terkait</h2>
            <FacilityGrid :slugs="pkg.facilitySlugs" />
          </section>

          <section class="space-y-5">
            <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Lokasi</h2>
            <MapEmbed :location="location" />
            <Button variant="link" size="sm" :to="`/${location.slug}`" class="px-0">
              Lihat selengkapnya soal CampX {{ location.shortName }}
            </Button>
          </section>

          <section v-if="packageFaqs.length" class="max-w-3xl space-y-4">
            <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Pertanyaan umum</h2>
            <Accordion type="single" collapsible class="w-full">
              <AccordionItem v-for="faq in packageFaqs" :key="faq.id" :value="faq.id">
                <AccordionTrigger class="text-left">{{ faq.question }}</AccordionTrigger>
                <AccordionContent>
                  <div class="typeset typeset-cms" v-html="faq.answer" />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>

        <aside class="lg:col-span-5 xl:col-span-4">
          <div class="sticky top-[calc(var(--navbar-height-desktop)+1rem)] hidden lg:block">
            <BookingPanel :pkg="pkg" />
          </div>
        </aside>
      </div>
    </div>

    <section v-if="related.length" class="container space-y-6 pt-8">
      <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">
        Paket lain di {{ location.shortName }}
      </h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PackageCard v-for="item in related" :key="item.id" :pkg="item" />
      </div>
    </section>

    <BookingStickyBar :pkg="pkg" />
  </div>
</template>

<script setup lang="ts">
import { resolveCategories } from "~/data/categories";
import { faqsFor } from "~/data/faqs";
import { getLocation } from "~/data/locations";
import { getPackage, packageExists, relatedPackages } from "~/data/packages";

definePageMeta({
  // Same source of truth the prerender seeds come from (`app/data/routes.ts`),
  // which is what keeps a seeded route from 404ing and hard-failing the build.
  validate: (route) =>
    packageExists(String(route.params.location), String(route.params.slug)),
});

defineOptions({ name: "location-slug" });

const route = useRoute();

const pkg = computed(() =>
  getPackage(String(route.params.location), String(route.params.slug)),
);
const location = computed(() =>
  pkg.value ? getLocation(pkg.value.locationSlug) : null,
);

const { formatCompact } = usePriceDisplay();

const categories = computed(() =>
  pkg.value ? resolveCategories(pkg.value.categorySlugs) : [],
);

const related = computed(() => (pkg.value ? relatedPackages(pkg.value, 4) : []));

const packageFaqs = computed(() =>
  pkg.value
    ? faqsFor("package", {
        locationSlug: pkg.value.locationSlug,
        categorySlug: pkg.value.categorySlugs[0],
      })
    : [],
);

/** What a visitor should know before booking. */
const thingsToKnow = computed(() => pkg.value?.requirements ?? []);

const quickFacts = computed(() => {
  const current = pkg.value;
  if (!current) return [];

  const out: { icon: string; label: string; value: string }[] = [];

  if (current.duration?.label) {
    out.push({ icon: "hugeicons:clock-01", label: "Durasi", value: current.duration.label });
  }
  if (current.distanceKm) {
    out.push({ icon: "hugeicons:route-01", label: "Jarak", value: `${current.distanceKm} km` });
  }
  if (current.capacity?.max) {
    out.push({
      icon: "hugeicons:user-group",
      label: "Kapasitas",
      value: `Maks. ${current.capacity.max} ${current.capacity.unit}`,
    });
  }
  if (current.pricing.minPax) {
    out.push({
      icon: "hugeicons:user-group-02",
      label: "Minimal",
      value: `${current.pricing.minPax} orang`,
    });
  }
  if (current.ageLimit) {
    out.push({ icon: "hugeicons:baby-01", label: "Usia", value: current.ageLimit.label });
  }
  if (current.checkInOut) {
    out.push({
      icon: "hugeicons:calendar-check-in-01",
      label: "Check-in",
      value: `${current.checkInOut.in} / ${current.checkInOut.out}`,
    });
  }
  if (current.meetingPoint) {
    out.push({
      icon: "hugeicons:location-01",
      label: "Titik kumpul",
      value: current.meetingPoint,
    });
  }

  return out.slice(0, 4);
});

/**
 * Title formula: "{package} - CampX {branch}, {regency}". Description leads with
 * the one-liner and closes with the price, because that is what a searcher is
 * scanning the snippet for.
 */
usePageMeta(null, {
  title: computed(() => {
    const current = pkg.value;
    const branch = location.value;
    if (!current || !branch) return "";
    return (
      current.seo.title ??
      `${current.title} - CampX ${branch.shortName}, ${branch.address.regency}`
    );
  }),
  description: computed(() => {
    const current = pkg.value;
    if (!current) return "";
    if (current.seo.description) return current.seo.description;
    const price = formatCompact(current.pricing.fromAmount);
    const prefix = current.pricing.tiers.length > 1 ? "Mulai " : "";
    return `${current.shortDescription} ${prefix}${price}.`;
  }),
});

useHead({
  titleTemplate: "%s",
});

// Product (or TouristTrip when there is a real itinerary) plus breadcrumbs.
// No FAQPage: the same questions are marked up once, on /faq.
const { buildPackage, buildBreadcrumbList, emit } = useJsonLd();

emit([
  pkg.value ? buildPackage(pkg.value, location.value) : null,
  pkg.value && location.value
    ? buildBreadcrumbList([
        { label: "Beranda", to: "/" },
        { label: location.value.shortName, to: `/${location.value.slug}` },
        { label: pkg.value.title, to: `/${pkg.value.locationSlug}/${pkg.value.slug}` },
      ])
    : null,
]);
</script>
