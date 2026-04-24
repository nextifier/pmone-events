<template>
  <section id="trusted-by">
    <div class="container">
      <h2
        class="text-center text-base font-semibold tracking-tight text-black sm:text-lg dark:text-white"
      >
        Trusted by companies of all sizes
      </h2>
    </div>

    <div class="relative isolate mt-3">
      <div
        class="from-background pointer-events-none absolute inset-y-0 left-0 z-20 w-[10%] bg-linear-to-r to-transparent mask-r-from-20% mask-r-to-100% backdrop-blur-lg"
      ></div>
      <div
        class="from-background pointer-events-none absolute inset-y-0 right-0 z-20 w-[10%] bg-linear-to-l to-transparent mask-l-from-20% mask-l-to-100% backdrop-blur-lg"
      ></div>

      <Marquee class="relative z-10 [--duration:56s]">
        <div
          v-for="(item, index) in clients"
          :key="index"
          class="aspect-3/2 h-16 overflow-hidden sm:h-20"
        >
          <NuxtImg
            :src="item.img"
            :alt="item.name"
            class="pointer-events-none h-full w-full rounded-2xl object-contain select-none hover:grayscale-0 dark:brightness-90 dark:contrast-200 dark:grayscale dark:invert-[75%] dark:hover:bg-white dark:hover:filter-none"
            width="300"
            height="200"
            sizes="200px"
            :format="item.isVector ? '' : 'webp'"
            loading="lazy"
          />
        </div>
      </Marquee>
    </div>
  </section>
</template>

<script setup>
const clients = useClientsStore().list;
</script>
