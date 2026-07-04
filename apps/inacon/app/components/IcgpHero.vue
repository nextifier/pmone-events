<template>
  <section id="icgp-hero" class="container">
    <div class="flex flex-col items-center text-center">
      <div class="flex h-24 items-center gap-x-4 lg:h-32">
        <LogoIcgp class="h-full w-auto text-black dark:text-white" />
        <NuxtImg
          src="/img/logo/logo-wcs-indonesia.svg"
          alt="World Cosplay Summit Indonesia"
          class="pointer-events-none h-full w-auto select-none"
          width="742"
          height="642"
          loading="lazy"
        />
      </div>

      <span class="text-muted-foreground mt-6 tracking-tight lg:mt-10">
        {{ $t("icgp.heroSubtitle") }}
      </span>
      <h1 class="section-title mt-3 text-center">
        {{ $t("icgp.heroTitle") }}
      </h1>
      <p class="section-description mx-auto mt-4 text-center">
        {{ $t("icgp.heroTagline") }}
      </p>

      <div class="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Badge icon="hugeicons:calendar-03">{{ $t("icgp.heroDate") }}</Badge>
        <Badge icon="hugeicons:location-01">{{ $t("icgp.heroVenue") }}</Badge>
        <Badge icon="hugeicons:champion">{{ $t("icgp.heroStage") }}</Badge>
      </div>
    </div>
  </section>
</template>

<script setup></script>
