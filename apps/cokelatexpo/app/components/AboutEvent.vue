<template>
  <div
    class="space-y-16 overflow-hidden lg:space-y-24"
    :class="{
      'pt-6': getRouteBaseName(route) === 'ticket',
    }"
  >
    <div class="container">
      <div class="mx-auto flex max-w-4xl flex-col">
        <h2 class="section-title-large text-balance">
          <SplitText
            splitType="words"
            ease="expo.out"
            :delay="150"
            :duration="2"
            :text="$t('about.sectionTitle')"
          />
        </h2>

        <div
          class="text-primary mt-2 space-y-6 text-2xl !leading-[1.3] font-semibold tracking-tighter text-pretty sm:text-3xl"
        >
          <p v-html="$t('about.sectionDescription')"></p>
          <p>
            {{ $t("about.sectionDescription2") }}
          </p>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div
            class="bg-kv-brown-800 relative flex flex-col items-start overflow-hidden rounded-2xl px-6 pt-0 pb-20 text-left text-white"
          >
            <InvertedBorderRadius
              position="top-left"
              :style="{
                '--ibr-background': 'var(--background)',
              }"
            >
              <span
                class="bg-kv-brown-800 flex size-18 items-center justify-center text-white"
              >
                <LogoICFIcon class="size-14" />
              </span>
            </InvertedBorderRadius>

            <div class="ml-14 pt-5 pl-5">
              <LogoICFAcronym class="h-9" />
            </div>

            <h3 class="font-display mt-12 text-4xl">
              {{ $t("about.zones.coffee.title") }}
            </h3>
            <p class="mt-2 tracking-tight">
              {{ $t("about.zones.coffee.description") }}
            </p>

            <div
              class="absolute inset-x-0 bottom-0 grid h-8 w-full grid-cols-11 *:flex *:items-center *:justify-center *:text-center *:font-mono *:text-[9px] *:text-nowrap"
            >
              <span class="bg-kv-brown-50 text-kv-brown-900">50</span>
              <span class="bg-kv-brown-100 text-kv-brown-900">100</span>
              <span class="bg-kv-brown-200 text-kv-brown-900">200</span>
              <span class="bg-kv-brown-300 text-kv-brown-900">300</span>
              <span class="bg-kv-brown-400 text-kv-brown-900">400</span>
              <span class="bg-kv-brown-500 text-white">500</span>
              <span class="bg-kv-brown-600 text-white">600</span>
              <span class="bg-kv-brown-700 text-white">700</span>
              <span class="bg-kv-brown-800 text-white">800</span>
              <span class="bg-kv-brown-900 text-white">900</span>
              <span class="bg-kv-brown-950 text-white">950</span>
            </div>
          </div>

          <div
            class="bg-kv-green-600 relative flex flex-col items-start overflow-hidden rounded-2xl px-6 pt-0 pb-20 text-left text-white"
          >
            <InvertedBorderRadius
              position="top-left"
              :style="{
                '--ibr-background': 'var(--background)',
              }"
            >
              <span
                class="bg-kv-green-600 flex size-18 items-center justify-center text-white"
              >
                <LogoITFIcon class="size-14" />
              </span>
            </InvertedBorderRadius>

            <div class="ml-14 pt-5 pl-5">
              <LogoITFAcronym class="h-9" />
            </div>

            <h3 class="font-display mt-12 text-4xl">
              {{ $t("about.zones.tea.title") }}
            </h3>
            <p class="mt-2 text-base font-medium tracking-tight">
              {{ $t("about.zones.tea.description") }}
            </p>

            <div
              class="absolute inset-x-0 bottom-0 grid h-8 w-full grid-cols-11 *:flex *:items-center *:justify-center *:text-center *:font-mono *:text-[9px] *:text-nowrap"
            >
              <span class="bg-kv-green-50 text-kv-green-900">50</span>
              <span class="bg-kv-green-100 text-kv-green-900">100</span>
              <span class="bg-kv-green-200 text-kv-green-900">200</span>
              <span class="bg-kv-green-300 text-kv-green-900">300</span>
              <span class="bg-kv-green-400 text-kv-green-900">400</span>
              <span class="bg-kv-green-500 text-white">500</span>
              <span class="bg-kv-green-600 text-white">600</span>
              <span class="bg-kv-green-700 text-white">700</span>
              <span class="bg-kv-green-800 text-white">800</span>
              <span class="bg-kv-green-900 text-white">900</span>
              <span class="bg-kv-green-950 text-white">950</span>
            </div>
          </div>

          <div
            class="bg-kv-purple-800 relative flex flex-col items-start overflow-hidden rounded-2xl px-6 pt-0 pb-20 text-left text-white"
          >
            <InvertedBorderRadius
              position="top-left"
              :style="{
                '--ibr-background': 'var(--background)',
              }"
            >
              <span
                class="bg-kv-purple-800 flex size-18 items-center justify-center text-white"
              >
                <LogoIWFIcon class="size-14" />
              </span>
            </InvertedBorderRadius>

            <div class="ml-14 pt-5 pl-5">
              <LogoIWFAcronym class="h-9" />
            </div>

            <h3 class="font-display mt-12 text-4xl">
              {{ $t("about.zones.wine.title") }}
            </h3>
            <p class="mt-2 text-base font-medium tracking-tight">
              {{ $t("about.zones.wine.description") }}
            </p>

            <div
              class="absolute inset-x-0 bottom-0 grid h-8 w-full grid-cols-11 *:flex *:items-center *:justify-center *:text-center *:font-mono *:text-[9px] *:text-nowrap"
            >
              <span class="bg-kv-purple-50 text-kv-purple-900">50</span>
              <span class="bg-kv-purple-100 text-kv-purple-900">100</span>
              <span class="bg-kv-purple-200 text-kv-purple-900">200</span>
              <span class="bg-kv-purple-300 text-kv-purple-900">300</span>
              <span class="bg-kv-purple-400 text-kv-purple-900">400</span>
              <span class="bg-kv-purple-500 text-white">500</span>
              <span class="bg-kv-purple-600 text-white">600</span>
              <span class="bg-kv-purple-700 text-white">700</span>
              <span class="bg-kv-purple-800 text-white">800</span>
              <span class="bg-kv-purple-900 text-white">900</span>
              <span class="bg-kv-purple-950 text-white">950</span>
            </div>
          </div>
        </div>

        <div
          class="text-primary mt-16 space-y-6 text-2xl !leading-[1.3] font-semibold tracking-tighter text-pretty sm:text-3xl"
        >
          <p v-html="$t('about.accessNote')"></p>
          <p>
            {{ $t("about.accessNote2") }}
          </p>
        </div>
      </div>
    </div>

    <MainPrograms />
  </div>
</template>

<script setup>
const route = useRoute();
const getRouteBaseName = useRouteBaseName();
</script>
