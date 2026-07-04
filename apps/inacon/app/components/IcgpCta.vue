<template>
  <section id="icgp-cta" class="px-1.5 sm:container sm:px-0">
    <div
      class="relative flex flex-col items-center rounded-3xl bg-black px-4 pb-16 text-white sm:px-8 lg:rounded-[48px] lg:px-12 dark:bg-gray-900 dark:text-white"
    >
      <div class="relative -mt-16 -mb-[140px] lg:-mb-[180px]">
        <NuxtImg
          src="/img/mascots/mascot-clash-3.png"
          alt=""
          class="pointer-events-none z-0 w-[160px] select-none lg:w-[240px]"
          width="400"
          height="851"
          sizes="400px"
          loading="lazy"
          format="webp"
        />

        <div
          class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black dark:from-gray-900"
        ></div>
      </div>

      <div class="relative z-10 flex flex-col items-center text-center">
        <h2
          class="text-[2.5rem] !leading-[1.25] font-semibold tracking-[-0.06em] text-balance text-white sm:text-6xl"
        >
          {{ $t("icgp.ctaTitle") }}
        </h2>

        <i18n-t
          keypath="icgp.ctaDescription"
          tag="p"
          scope="global"
          class="mt-3 max-w-screen-md text-base tracking-tight sm:text-lg"
        >
          <template #icc>
            <a
              href="https://indonesiacomiccon.com"
              target="_blank"
              rel="noopener noreferrer"
              class="underline underline-offset-2 transition hover:opacity-80"
              >Indonesia Comic Con 2026</a
            >
          </template>
        </i18n-t>

        <div class="mt-6 lg:mt-8">
          <nuxt-link
            to="https://pmone.id/icc-icgp2027"
            target="_blank"
            class="hover:bg-opacity-80 flex items-center gap-x-1.5 rounded-full bg-white px-6 py-4 text-center font-medium tracking-tight text-black transition active:scale-95"
            v-ripple
          >
            {{ $t("icgp.ctaButton") }}
            <Icon name="hugeicons:arrow-right-01" class="size-5 shrink-0" />
          </nuxt-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup></script>
