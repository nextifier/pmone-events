<template>
  <div class="container space-y-14 py-10 lg:space-y-20 lg:py-16">
    <header class="max-w-3xl space-y-4">
      <h1 class="text-4xl font-medium tracking-tighter text-balance sm:text-5xl">
        Tentang CampX Holiday Park
      </h1>
      <p class="text-muted-foreground text-base tracking-tight text-pretty sm:text-lg">
        Kami mengelola dua holiday park di Jawa Barat. Satu di tepi Waduk Jatiluhur,
        Purwakarta. Satu lagi di tepi Sungai Citarik, Cikidang, Sukabumi.
      </p>
    </header>

    <section class="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div class="typeset max-w-none">
        <p>
          Banyak orang ingin camping tapi berhenti di urusan alat: tidak punya tenda, tidak
          tahu cara memasangnya, tidak yakin ada air bersih di lokasi. Jadi kami membalik
          urutannya. Perlengkapan sudah ada di tempat, listrik dan air sampai ke kavling, dan
          kalau mau lebih nyaman lagi ada cabin yang tinggal ditempati.
        </p>
        <p>
          Pemandangannya tetap yang utama. Itu sebabnya kavling di Jatiluhur menghadap air,
          bukan menghadap tenda tetangga. Di Cikidang, area campground yang paling dicari
          adalah yang paling dekat sungai, karena suara airnya terdengar semalaman.
        </p>
        <p>
          Untuk perusahaan, kami menyiapkan susunan acaranya dan menurunkan fasilitator yang
          memandu. Rombongan yang datang biasanya punya target sendiri, entah mengakrabkan tim
          baru atau menutup kuartal, dan susunan acaranya kami sesuaikan dengan target itu.
        </p>
      </div>

      <div class="space-y-6">
        <div
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
            sizes="400px lg:520px"
            class="aspect-16/10 w-full object-cover"
          />
          <div class="space-y-2 p-5">
            <div class="flex items-center gap-x-2">
              <h2 class="text-lg font-medium tracking-tighter">{{ location.name }}</h2>
              <Badge v-if="isNewLocation(location)" variant="info" plain>Baru</Badge>
            </div>
            <p class="text-muted-foreground text-sm tracking-tight text-pretty">
              {{ location.description }}
            </p>
            <Button variant="outline" size="sm" :to="`/${location.slug}`">
              <span>Lihat {{ location.shortName }}</span>
              <Icon name="hugeicons:arrow-right-01" class="size-4 shrink-0" />
            </Button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="coverage.length" class="space-y-5">
      <h2 class="text-2xl font-medium tracking-tighter sm:text-3xl">Diliput media</h2>
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="item in coverage" :key="item.id">
          <NuxtLink
            :to="item.url"
            target="_blank"
            rel="noopener"
            class="focusable border-border hover:bg-muted flex h-full flex-col gap-y-2 rounded-xl border p-4 transition-colors"
          >
            <span class="text-muted-foreground text-xs tracking-tight sm:text-sm">
              {{ item.outlet }}
            </span>
            <span class="text-sm font-medium tracking-tight text-pretty">{{ item.title }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="border-border space-y-2 rounded-xl border p-6">
      <h2 class="text-base font-medium tracking-tight">Badan usaha</h2>
      <p class="text-muted-foreground text-sm tracking-tight">
        {{ company.name }}<br />
        {{ company.address }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { isNewLocation, LOCATIONS } from "~/data/locations";
import { MEDIA_COVERAGE } from "~/data/social-proof";

usePageMeta("tentang");

defineOptions({ name: "tentang" });

const locations = LOCATIONS;
const coverage = MEDIA_COVERAGE;
const company = useAppConfig().app.company;
</script>
