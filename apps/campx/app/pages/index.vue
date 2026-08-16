<template>
  <div class="space-y-16 pb-16 lg:space-y-24">
    <SiteHero />

    <!-- Pick a branch. This is the decision every visitor has to make first. -->
    <section class="container space-y-5">
      <div class="max-w-2xl space-y-1">
        <h2 class="text-2xl font-semibold tracking-tighter sm:text-3xl">Pilih cabangnya dulu</h2>
        <p class="text-muted-foreground text-base tracking-tight text-pretty">
          Danau yang tenang di Purwakarta, atau sungai berarus di Sukabumi.
        </p>
      </div>

      <div class="grid gap-5 md:grid-cols-2">
        <NuxtLink
          v-for="location in locations"
          :key="location.slug"
          :to="`/${location.slug}`"
          class="focusable group block"
        >
          <div class="bg-muted relative aspect-16/10 overflow-hidden rounded-3xl">
            <NuxtImg
              :src="location.heroMedia.src"
              :alt="location.heroMedia.alt"
              :width="location.heroMedia.width"
              :height="location.heroMedia.height"
              format="webp"
              loading="lazy"
              sizes="100vw md:640px"
              class="h-full w-full object-cover"
            />
            <!-- style-guide: Teks di atas warna arbitrer user. -->
            <div class="photo-scrim" />

            <div class="absolute inset-x-0 bottom-0 space-y-1 p-6">
              <div class="flex items-center gap-x-2">
                <h3 class="text-2xl font-semibold tracking-tighter text-white">
                  {{ location.name }}
                </h3>
                <Badge v-if="isNewLocation(location)" variant="info" plain>Baru</Badge>
              </div>
              <p class="text-base tracking-tight text-white/85">{{ location.tagline }}</p>
            </div>
          </div>

          <div class="mt-4 space-y-2">
            <p class="text-muted-foreground text-base tracking-tight text-pretty">
              {{ location.description }}
            </p>
            <div class="text-muted-foreground flex flex-wrap gap-x-5 gap-y-1 text-base tracking-tight">
              <span v-if="location.distanceFromJakarta" class="inline-flex items-center gap-x-1.5">
                <Icon name="hugeicons:car-01" class="size-4 shrink-0" />
                {{ location.distanceFromJakarta.label }}
              </span>
              <span class="inline-flex items-center gap-x-1.5">
                <Icon name="hugeicons:tag-01" class="size-4 shrink-0" />
                Mulai {{ formatCompact(lowestPriceAt(location.slug) ?? 0) }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- One rail per category, the way a marketplace home page works: the
         catalog comes to the visitor instead of hiding behind a filter. -->
    <PackageSlider
      v-for="rail in rails"
      :key="rail.id"
      :title="rail.title"
      :description="rail.description"
      :packages="rail.packages"
      :more-href="rail.moreHref"
    />

    <!-- Why -->
    <section class="container">
      <div class="border-border grid gap-8 rounded-3xl border p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-10">
        <div v-for="reason in reasons" :key="reason.title" class="space-y-2">
          <Icon :name="reason.icon" class="text-brand size-6" />
          <h3 class="text-lg font-semibold tracking-tighter">{{ reason.title }}</h3>
          <p class="text-muted-foreground text-base tracking-tight text-pretty">
            {{ reason.body }}
          </p>
        </div>
      </div>
    </section>

    <!-- Corporate -->
    <section class="container">
      <div class="border-border grid gap-6 overflow-hidden rounded-3xl border lg:grid-cols-2">
        <div class="space-y-4 p-6 lg:p-10">
          <p class="section-eyebrow">Untuk perusahaan</p>
          <h2 class="text-2xl font-semibold tracking-tighter text-balance sm:text-3xl">
            Outing yang acaranya kami susun
          </h2>
          <p class="text-muted-foreground text-base tracking-tight text-pretty">
            Rombongan kantor, komunitas, dan sekolah biasanya datang dengan kendala yang sama:
            pesertanya banyak, waktunya sempit. Susunan acara, fasilitator, dan dokumentasinya
            kami yang urus.
          </p>
          <div class="flex flex-wrap gap-3 pt-1">
            <Button size="lg" to="/outing">Lihat paket outing</Button>
            <Button size="lg" variant="outline" to="/kontak">Minta penawaran</Button>
          </div>
        </div>

        <NuxtImg
          src="/img/outing-img.jpeg"
          alt="Rombongan outing kantor di CampX Jatiluhur"
          :width="867"
          :height="1156"
          format="webp"
          loading="lazy"
          sizes="100vw lg:640px"
          class="aspect-16/10 h-full w-full object-cover lg:aspect-auto"
        />
      </div>
    </section>

    <section v-if="coverage.length" class="container space-y-4">
      <h2 class="text-muted-foreground text-base tracking-tight">Diliput oleh</h2>
      <ul class="flex flex-wrap gap-x-8 gap-y-3">
        <li v-for="item in coverage" :key="item.id">
          <NuxtLink
            :to="item.url"
            target="_blank"
            rel="noopener"
            class="focusable text-muted-foreground hover:text-foreground text-lg font-semibold tracking-tighter transition-colors"
          >
            {{ item.outlet }}
          </NuxtLink>
        </li>
      </ul>
    </section>

    <ShortsSlider />

    <FAQ tag="h2" />

    <FAB />
  </div>
</template>

<script setup lang="ts">
import { isNewLocation, LOCATIONS } from "~/data/locations";
import { lowestPriceAt, packagesByCategory, packagesByLocation, PUBLIC_PACKAGES } from "~/data/packages";
import { MEDIA_COVERAGE } from "~/data/social-proof";

usePageMeta("home");

defineOptions({ name: "index" });

const { formatCompact } = usePriceDisplay();

const locations = LOCATIONS;
const coverage = MEDIA_COVERAGE;

/**
 * Rails are built from the data, so a new package appears on the home page
 * without anyone editing this file. Empty rails drop out.
 */
const rails = computed(() =>
  [
    {
      id: "menginap",
      title: "Menginap di alam",
      description: "Tenda, kavling, atau cabin. Di dua cabang.",
      packages: PUBLIC_PACKAGES.filter((pkg) => pkg.type === "stay"),
      moreHref: "/paket?tipe=stay",
    },
    {
      id: "rafting",
      title: "Rafting Sungai Citarik",
      description: "Lima jalur, dari 5 sampai 17 kilometer.",
      packages: packagesByCategory("rafting"),
      moreHref: "/paket?kategori=rafting",
    },
    {
      id: "air",
      title: "Main air di Jatiluhur",
      description: "Paddle board, perahu, dan mancing di tepi waduk.",
      packages: packagesByCategory("aktivitas-air"),
      moreHref: "/paket?kategori=aktivitas-air",
    },
    {
      id: "darat",
      title: "Adrenalin di darat",
      description: "Flying fox, ATV, trekking, dan paintball di Cikidang.",
      packages: packagesByCategory("aktivitas-darat"),
      moreHref: "/paket?kategori=aktivitas-darat",
    },
    {
      id: "outing",
      title: "Day trip & outing rombongan",
      description: "Rangkaian sehari penuh sampai dua hari satu malam.",
      packages: PUBLIC_PACKAGES.filter((pkg) => pkg.type === "trip" || pkg.type === "outing" || pkg.type === "pass"),
      moreHref: "/outing",
    },
    {
      id: "cikidang",
      title: "Semua di CampX Cikidang",
      description: "Cabang terbaru kami di Sukabumi.",
      packages: packagesByLocation("cikidang"),
      moreHref: "/cikidang",
    },
  ].filter((rail) => rail.packages.length > 0),
);

const reasons = [
  {
    icon: "hugeicons:tent",
    title: "Perlengkapan sudah di tempat",
    body: "Tenda, matras, dan lampu terpasang sebelum kamu sampai. Tidak perlu belanja atau meminjam.",
  },
  {
    icon: "hugeicons:car-01",
    title: "Dekat dari kota",
    body: "Jatiluhur dua jam dari Jakarta lewat Tol Cipularang. Cikidang lewat Tol Bocimi.",
  },
  {
    icon: "hugeicons:shield-01",
    title: "Aktivitas berpemandu",
    body: "Rafting dan aktivitas lain dijalankan dengan pemandu, tim rescue, dan asuransi peserta.",
  },
  {
    icon: "hugeicons:user-group-02",
    title: "Siap untuk rombongan",
    body: "Aula, amfiteater 200 orang, dan fasilitator untuk outing kantor.",
  },
];

// Organization is the node every other page references by @id, so it is emitted
// once, here. WebSite already comes from usePageMeta.
const profile = useProjectProfile();
const { buildOrganization, emit } = useJsonLd();

emit([
  buildOrganization(
    (profile.socialLinks ?? [])
      .map((link: { url?: string }) => link?.url)
      .filter((url: string | undefined): url is string => Boolean(url)),
  ),
]);
</script>
