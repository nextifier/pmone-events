<template>
  <div class="space-y-16 pb-16 lg:space-y-24">
    <section class="container space-y-6 pt-10 lg:pt-16">
      <div class="max-w-3xl space-y-4">
        <p class="section-eyebrow">Untuk perusahaan, komunitas, dan sekolah</p>
        <h1 class="text-4xl font-medium tracking-tighter text-balance sm:text-5xl">
          Paket outing kantor dan team building di dua lokasi
        </h1>
        <p class="text-muted-foreground text-base tracking-tight text-pretty sm:text-lg">
          Kami menyusun acaranya, memandu jalannya, dan mengirim dokumentasinya. Kamu tinggal
          bawa timnya. Pilih danau yang tenang di Purwakarta, atau sungai berarus di Sukabumi.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <Button size="lg" @click="uiStore.openContactDialog()">Minta penawaran</Button>
        <Button v-if="whatsappUrl" variant="outline" size="lg" :to="whatsappUrl">
          <Icon name="hugeicons:whatsapp" class="size-4 shrink-0" />
          <span>Diskusi lewat WhatsApp</span>
        </Button>
      </div>

      <dl class="border-border grid grid-cols-2 gap-x-6 gap-y-6 border-t pt-8 sm:grid-cols-4">
        <div v-for="stat in stats" :key="stat.label" class="space-y-1">
          <dt class="text-muted-foreground text-sm tracking-tight">{{ stat.label }}</dt>
          <dd class="text-2xl font-medium tracking-tighter sm:text-3xl">{{ stat.value }}</dd>
        </div>
      </dl>
    </section>

    <section class="container space-y-6">
      <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Dua lokasi, dua karakter</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <article
          v-for="location in locations"
          :key="location.slug"
          class="border-border overflow-hidden rounded-xl border"
        >
          <NuxtImg
            :src="location.heroMedia.src"
            :alt="location.heroMedia.alt"
            :width="location.heroMedia.width"
            :height="location.heroMedia.height"
            format="webp"
            loading="lazy"
            sizes="400px lg:600px"
            class="aspect-16/9 w-full object-cover"
          />
          <div class="space-y-3 p-5">
            <div class="flex items-center gap-x-2">
              <h3 class="text-lg font-medium tracking-tighter">{{ location.name }}</h3>
              <Badge v-if="isNewLocation(location)" variant="info" plain>Baru</Badge>
            </div>
            <p class="text-muted-foreground text-sm tracking-tight text-pretty">
              {{ location.description }}
            </p>
            <ul class="space-y-1.5">
              <li
                v-for="facility in corporateFacilities(location)"
                :key="facility.slug"
                class="flex items-center gap-x-2 text-sm tracking-tight"
              >
                <Icon :name="facility.icon" class="text-muted-foreground size-4 shrink-0" />
                {{ facility.name }}
              </li>
            </ul>
            <Button variant="outline" size="sm" :to="`/${location.slug}`">
              <span>Lihat {{ location.shortName }}</span>
            </Button>
          </div>
        </article>
      </div>
    </section>

    <section v-if="outingPackages.length" class="container space-y-6">
      <div class="max-w-2xl space-y-2">
        <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Paket yang sudah jadi</h2>
        <p class="text-muted-foreground text-sm tracking-tight text-pretty sm:text-base">
          Tiga rangkaian yang paling sering diambil. Susunan acaranya masih bisa digeser sesuai
          kebutuhan tim kamu.
        </p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PackageCard v-for="pkg in outingPackages" :key="pkg.id" :pkg="pkg" />
      </div>
    </section>

    <section class="container space-y-6">
      <div class="max-w-2xl space-y-2">
        <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Rangkai sendiri</h2>
        <p class="text-muted-foreground text-sm tracking-tight text-pretty sm:text-base">
          Semua aktivitas di bawah bisa dikombinasikan jadi setengah hari, sehari penuh, atau
          dua hari satu malam. Angka minimal peserta menentukan mana yang bisa jalan.
        </p>
      </div>

      <div v-for="group in activityMenu" :key="group.slug" class="space-y-3">
        <h3 class="text-base font-medium tracking-tight">Di {{ group.name }}</h3>
        <ul class="divide-border border-border divide-y rounded-xl border">
          <li v-for="pkg in group.packages" :key="pkg.id">
            <NuxtLink
              :to="`/${pkg.locationSlug}/${pkg.slug}`"
              class="focusable hover:bg-muted flex items-center gap-4 px-4 py-3 transition-colors"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium tracking-tight">{{ pkg.title }}</p>
                <p class="text-muted-foreground truncate text-xs tracking-tight sm:text-sm">
                  {{ minPaxLabel(pkg) }}
                </p>
              </div>
              <span class="shrink-0 text-sm tracking-tight tabular-nums">
                {{ formatCompact(pkg.pricing.fromAmount) }}{{ unitLabel(pkg.pricing.unit) }}
              </span>
              <Icon name="hugeicons:arrow-right-01" class="text-muted-foreground size-4 shrink-0" />
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <section v-if="sampleItinerary" class="container space-y-6">
      <div class="max-w-2xl space-y-2">
        <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Contoh susunan acara</h2>
        <p class="text-muted-foreground text-sm tracking-tight text-pretty sm:text-base">
          Diambil dari {{ sampleItinerary.title }}. Ini gambaran ritmenya, bukan jadwal mati.
        </p>
      </div>
      <ItineraryTimeline :days="sampleItinerary.itinerary" />
    </section>

    <section class="container space-y-6">
      <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Cara kerjanya</h2>
      <ol class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="border-border space-y-2 rounded-xl border p-5"
        >
          <span class="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg text-sm tabular-nums">
            {{ index + 1 }}
          </span>
          <h3 class="text-base font-medium tracking-tight">{{ step.title }}</h3>
          <p class="text-muted-foreground text-sm tracking-tight text-pretty">{{ step.body }}</p>
        </li>
      </ol>
    </section>

    <section class="container">
      <div class="mx-auto max-w-2xl">
        <ContactForm
          title="Ceritakan rencana outing kamu"
          description="Sebutkan jumlah peserta, tanggal, dan lokasi yang diminati. Tim kami balas dengan susunan acara dan penawarannya."
          subject="Outing Inquiry"
          show-brand-name
          show-job-title
          brand-name-label="Nama perusahaan"
          submit-label="Kirim permintaan"
        />
      </div>
    </section>

    <section class="container max-w-3xl space-y-4">
      <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Pertanyaan soal outing</h2>
      <Accordion type="single" collapsible class="w-full">
        <AccordionItem v-for="faq in outingFaqs" :key="faq.id" :value="faq.id">
          <AccordionTrigger class="text-left">{{ faq.question }}</AccordionTrigger>
          <AccordionContent>
            <div class="typeset typeset-cms" v-html="faq.answer" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  </div>
</template>

<script setup lang="ts">
import { resolveFacilities } from "~/data/facilities";
import { faqsFor } from "~/data/faqs";
import { isNewLocation, LOCATIONS } from "~/data/locations";
import { packagesByCategory, PUBLIC_PACKAGES } from "~/data/packages";
import type { Location, Package } from "~/data/types";

usePageMeta("outing");

defineOptions({ name: "outing" });

const uiStore = useUiStore();
const profile = useProjectProfile();
const { formatCompact, unitLabel } = usePriceDisplay();

const locations = LOCATIONS;
const outingFaqs = faqsFor("outing");

const outingPackages = computed(() => packagesByCategory("outing"));

const whatsappUrl = computed(() => {
  if (!profile.whatsappNumber) return "";
  const text = encodeURIComponent(
    "Halo CampX! Saya mau tanya paket outing untuk rombongan kantor.",
  );
  return `https://api.whatsapp.com/send?phone=${profile.whatsappNumber}&text=${text}`;
});

/**
 * Only numbers we can stand behind. The Jatiluhur figures come from CampX's own
 * venue guide; anything a branch has not published stays out rather than being
 * rounded up into a marketing claim.
 */
const stats = computed(() => {
  const jatiluhur = LOCATIONS.find((location) => location.slug === "jatiluhur");
  const out: { label: string; value: string }[] = [{ label: "Lokasi", value: `${LOCATIONS.length}` }];

  if (jatiluhur?.capacity?.campsite) {
    out.push({ label: "Kavling camping", value: `${jatiluhur.capacity.campsite}` });
  }
  if (jatiluhur?.capacity?.amphitheatre) {
    out.push({ label: "Amfiteater", value: `${jatiluhur.capacity.amphitheatre} orang` });
  }
  out.push({ label: "Paket & aktivitas", value: `${PUBLIC_PACKAGES.length}` });

  return out;
});

const corporateFacilities = (location: Location) =>
  resolveFacilities(location.facilitySlugs).filter(
    (facility) =>
      facility.group === "activity" ||
      ["parkir", "resepsionis", "support-24-jam", "dokumentasi"].includes(facility.slug),
  );

/** Activities a group can actually book, grouped by branch. */
const activityMenu = computed(() =>
  LOCATIONS.map((location) => ({
    slug: location.slug,
    name: location.name,
    packages: PUBLIC_PACKAGES.filter(
      (pkg) =>
        pkg.locationSlug === location.slug &&
        pkg.type === "activity" &&
        pkg.audience.some((entry) => entry === "grup" || entry === "korporat"),
    ),
  })).filter((group) => group.packages.length > 0),
);

const minPaxLabel = (pkg: Package) => {
  const parts: string[] = [];
  if (pkg.pricing.minPax) parts.push(`Minimal ${pkg.pricing.minPax} orang`);
  if (pkg.duration?.label) parts.push(pkg.duration.label);
  return parts.join(" · ") || "Tanpa minimal peserta";
};

/** The longest itinerary we have is the most useful illustration. */
const sampleItinerary = computed(() =>
  outingPackages.value
    .filter((pkg) => pkg.itinerary.length > 0)
    .sort((a, b) => b.itinerary.length - a.itinerary.length)
    .at(0) ?? null,
);

const { buildService, buildItemList, buildBreadcrumbList, emit } = useJsonLd();

emit([
  buildService(
    "Paket outing & team building CampX",
    "Outing kantor, gathering, dan team building di CampX Jatiluhur (Purwakarta) dan CampX Cikidang (Sukabumi), dengan fasilitator dan susunan acara yang disiapkan.",
  ),
  buildItemList(outingPackages.value, "Paket outing CampX"),
  buildBreadcrumbList([
    { label: "Beranda", to: "/" },
    { label: "Outing", to: "/outing" },
  ]),
]);

const steps = [
  {
    title: "Cerita dulu",
    body: "Jumlah peserta, tanggal, dan tujuan acaranya. Satu pesan WhatsApp sudah cukup untuk mulai.",
  },
  {
    title: "Kami susun acaranya",
    body: "Kami kirim susunan acara dan penawaran yang menyesuaikan lokasi, durasi, dan anggaran.",
  },
  {
    title: "Survei kalau perlu",
    body: "Untuk rombongan besar, tim kamu bisa datang lebih dulu melihat lokasinya langsung.",
  },
  {
    title: "Hari-H",
    body: "Fasilitator kami memandu jalannya acara, dan dokumentasinya kami kirim setelahnya.",
  },
];
</script>
