<template>
  <div
    class="space-y-16 lg:space-y-24"
    :class="{
      'pt-6': getRouteBaseName(route) === 'ticket',
    }"
  >
    <div class="container">
      <div
        class="grid grid-cols-1 items-center gap-x-6 gap-y-6 lg:grid-cols-2 xl:gap-x-12"
      >
        <div class="bg-muted aspect-square overflow-hidden rounded-2xl">
          <NuxtImg
            src="/img/about-img.jpg"
            alt=""
            class="pointer-events-none h-full w-full object-cover select-none"
            width="1000"
            height="667"
            sizes="100vw lg:1000px"
            loading="lazy"
            format="webp"
          />
        </div>

        <div class="flex flex-col items-start text-left">
          <span class="section-subtitle">{{ $t('about.sectionSubtitle') }}</span>

          <h2 class="section-title mt-2">
            {{ $t('about.sectionTitle') }}
          </h2>

          <p class="section-description mt-3">
            {{ $t('about.sectionDescription') }}
          </p>
        </div>
      </div>
    </div>

    <WhyVisit />

    <MainPrograms />
  </div>
</template>

<script setup>
const route = useRoute();
const getRouteBaseName = useRouteBaseName();
</script>
