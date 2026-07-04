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

      <div class="mt-8 flex flex-col items-center gap-1.5">
        <p
          class="text-primary text-2xl font-semibold tracking-tighter text-balance sm:text-3xl"
        >
          {{ $t("icgp.heroDate") }}
        </p>
        <p
          class="text-foreground text-base font-medium tracking-tight text-balance sm:text-lg"
        >
          {{ $t("icgp.heroVenue") }}
        </p>
        <i18n-t
          keypath="icgp.heroStage"
          tag="p"
          scope="global"
          class="text-muted-foreground text-sm tracking-tight sm:text-base"
        >
          <template #icc>
            <a
              href="https://indonesiacomiccon.com"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-foreground underline underline-offset-2 transition-colors"
              >Indonesia Comic Con 2026</a
            >
          </template>
        </i18n-t>
      </div>
    </div>
  </section>
</template>

<script setup></script>
