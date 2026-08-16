<template>
  <section class="container pt-8 lg:pt-12">
    <div class="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
      <div class="max-w-2xl space-y-5">
        <p class="section-eyebrow">Jatiluhur, Purwakarta &middot; Cikidang, Sukabumi</p>

        <h1 class="text-4xl font-semibold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
          Camping, rafting, dan outing di dua holiday park Jawa Barat
        </h1>

        <p class="text-muted-foreground max-w-xl text-lg tracking-tight text-pretty">
          Satu di tepi Waduk Jatiluhur, satu lagi di tepi Sungai Citarik. Perlengkapannya sudah
          ada di tempat, kamu tinggal datang.
        </p>

        <div class="flex flex-wrap gap-3">
          <Button size="xl" to="/paket">Lihat semua paket</Button>
          <Button size="xl" variant="outline" to="/outing">Rencanakan outing kantor</Button>
        </div>

      </div>

      <!-- Two portrait frames rather than one wide crop: every photo we have is
           3:4 or 4:5, and stretching one of them across a desktop hero showed a
           sliver of sky and nothing else. -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4">
        <div
          v-for="(frame, index) in frames"
          :key="frame.src"
          class="bg-muted overflow-hidden rounded-3xl"
          :class="index === 1 ? 'mt-8 lg:mt-12' : ''"
        >
          <NuxtImg
            :src="frame.src"
            :alt="frame.alt"
            :width="frame.width"
            :height="frame.height"
            format="webp"
            preload
            loading="eager"
            sizes="200px sm:280px lg:320px"
            class="aspect-3/4 h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { LOCATIONS } from "~/data/locations";

/** One frame per branch, so the hero already says there are two places. */
const frames = LOCATIONS.map((location) => ({
  src: location.heroMedia.src,
  alt: location.heroMedia.alt,
  width: location.heroMedia.width,
  height: location.heroMedia.height,
}));
</script>
