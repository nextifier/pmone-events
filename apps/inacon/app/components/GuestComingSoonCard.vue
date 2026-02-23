<template>
  <div class="@container">
    <div class="group relative isolate">
      <div
        class="absolute inset-x-0 bottom-0 z-0 aspect-[9/10] w-full overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-900"
      ></div>

      <div
        class="relative z-10 flex aspect-[4/5] h-full w-full items-center justify-center rounded-3xl"
      >
        <NuxtImg
          src="/img/guests/placeholder-aspect-4-5.png"
          alt=""
          class="pointer-events-none h-full w-full object-cover grayscale transition duration-300 select-none group-hover:grayscale-0"
          width="440"
          height="550"
          sizes="100vw sm:600px xl:800px"
          format="webp"
          loading="lazy"
        />
      </div>

      <div
        class="absolute inset-x-0 bottom-0 z-20 flex aspect-square w-full items-center justify-center"
      >
        <span
          class="text-center text-4xl !leading-[.8] font-extrabold tracking-tighter text-white [text-shadow:_0_2px_8px_rgb(0_0_0_/_60%)] @[300px]:text-5xl"
          >Coming Soon</span
        >
      </div>
    </div>

    <div class="flex flex-col pt-2">
      <div class="flex items-start justify-between gap-x-1">
        <div class="flex flex-col gap-y-0.5">
          <span
            class="!leading-tight font-semibold tracking-tight text-black dark:text-white"
          >
            The next guest will be revealed soon on Instagram
          </span>
        </div>

        <nuxt-link
          :to="`https://www.instagram.com/${useAppConfig().social.instagram}`"
          target="_blank"
          class="hover:bg-opacity-80 dark:hover:bg-opacity-80 flex aspect-square w-11 flex-shrink-0 flex-col items-center justify-center gap-y-0.5 rounded-full bg-black text-center text-white transition active:scale-95 sm:w-14 dark:bg-white dark:text-black"
        >
          <IconInstagram class="h-5" />
        </nuxt-link>
      </div>
    </div>

    <!-- <div
      class="mt-2 flex w-full flex-col items-center gap-y-3 px-2 text-center"
    >
      <span
        class="text-base font-semibold !leading-[1.2] tracking-tight text-black @[300px]:text-xl dark:text-white"
        >The next guest will be revealed soon on Instagram</span
      >

      <nuxt-link
        :to="`https://www.instagram.com/${useAppConfig().social.instagram}`"
        target="_blank"
        class="flex items-center gap-x-1.5 rounded-xl bg-black px-3 py-2.5 text-white transition hover:bg-opacity-80 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-opacity-80"
      >
        <IconInstagram class="h-4 sm:h-5" />
        <span class="text-sm font-semibold tracking-tight">Follow</span>
      </nuxt-link>
    </div> -->
  </div>
</template>

<script setup></script>
