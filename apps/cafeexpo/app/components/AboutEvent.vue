<template>
  <div
    class="space-y-16 overflow-hidden lg:space-y-24"
    :class="{
      'pt-6': ['ticket'].includes(route.name),
    }"
  >
    <div class="container flex flex-col lg:items-center lg:text-center">
      <h2 class="section-title-large">
        <SplitText
          splitType="words"
          ease="expo.out"
          :delay="150"
          :duration="2"
          :text="`
              <span class='text-accent'>Choose Your Flavor Adventure.</span>
            `"
        />
      </h2>

      <div
        class="text-primary mx-auto max-w-4xl space-y-4 text-2xl !leading-[1.3] font-semibold tracking-tighter text-balance sm:text-3xl"
      >
        <p>
          We've set up four distinct zones for you to explore: coffee, tea,
          wine, and chocolate. Take a look below and see which one calls to you
          first.
        </p>
      </div>

      <div
        class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-10 xl:grid-cols-4"
      >
        <div
          class="bg-kv-brown-800 relative flex flex-col items-start overflow-hidden rounded-2xl px-6 pt-0 pb-20 text-left text-white"
        >
          <InvertedBorderRadius
            position="top-left"
            class="[--ibr-background:var(--color-kv-brown-50)] dark:[--ibr-background:var(--color-kv-brown-950)]"
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

          <h6 class="font-display mt-12 text-4xl">Indonesia Coffee Festival</h6>
          <p class="mt-2 tracking-tight">
            This is the lively center of the expo. Hear the sound of espresso
            machines, watch the best baristas compete for titles, and find your
            new favorite coffee.
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
            class="[--ibr-background:var(--color-kv-brown-50)] dark:[--ibr-background:var(--color-kv-brown-950)]"
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

          <h6 class="font-display mt-12 text-4xl">Indonesia Tea Festival</h6>
          <p class="mt-2 text-base font-medium tracking-tight">
            Step into a calmer space dedicated to tea. Taste a wide variety of
            teas, from rare leaves to new blends, and learn simple ways to make
            a better cup at home.
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
            class="[--ibr-background:var(--color-kv-brown-50)] dark:[--ibr-background:var(--color-kv-brown-950)]"
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

          <h6 class="font-display mt-12 text-4xl">Indonesia Wine Festival</h6>
          <p class="mt-2 text-base font-medium tracking-tight">
            Enjoy wine tasting without the pressure. We've created a relaxed
            space to explore different wines from here and abroad. No
            complicated rules, just good wine.
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

        <div
          class="relative flex flex-col items-start overflow-hidden rounded-2xl bg-red-700 px-6 pt-0 pb-20 text-left text-white"
        >
          <InvertedBorderRadius
            position="top-left"
            class="[--ibr-background:var(--color-kv-brown-50)] dark:[--ibr-background:var(--color-kv-brown-950)]"
          >
            <span
              class="flex size-18 items-center justify-center bg-red-700 text-white"
            >
              <LogoCEIIcon class="size-14" />
            </span>
          </InvertedBorderRadius>

          <div class="ml-14 pt-5 pl-5">
            <LogoCEIAcronym class="h-9" />
          </div>

          <h6 class="font-display mt-12 text-4xl">Cokelat Expo Indonesia</h6>
          <p class="mt-2 text-base font-medium tracking-tight">
            Welcome to a chocolate lover's paradise. Meet the people who make
            the chocolate, see how it's done, and taste unique flavors you can't
            find anywhere else.
          </p>

          <div
            class="absolute inset-x-0 bottom-0 grid h-8 w-full grid-cols-11 *:flex *:items-center *:justify-center *:text-center *:font-mono *:text-[9px] *:text-nowrap"
          >
            <span class="bg-red-50 text-red-900">50</span>
            <span class="bg-red-100 text-red-900">100</span>
            <span class="bg-red-200 text-red-900">200</span>
            <span class="bg-red-300 text-red-900">300</span>
            <span class="bg-red-400 text-red-900">400</span>
            <span class="bg-red-500 text-white">500</span>
            <span class="bg-red-600 text-white">600</span>
            <span class="bg-red-700 text-white">700</span>
            <span class="bg-red-800 text-white">800</span>
            <span class="bg-red-900 text-white">900</span>
            <span class="bg-red-950 text-white">950</span>
          </div>
        </div>
      </div>
    </div>

    <MainPrograms />
  </div>
</template>

<script setup>
const route = useRoute();
</script>
