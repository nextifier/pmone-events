<template>
  <div class="relative isolate flex h-20 items-center">
    <div class="relative z-0 flex space-x-1 overflow-hidden">
      <span
        class="h-7 w-10 flex-shrink-0 -skew-x-12 bg-black dark:bg-gray-800"
      ></span>
      <span
        v-for="index in 200"
        :key="index"
        class="block h-7 w-3 flex-shrink-0 -skew-x-12"
        :class="
          index % 16 === 0
            ? 'bg-red-600 dark:bg-yellow-400'
            : 'bg-black dark:bg-gray-800'
        "
      ></span>
    </div>

    <div
      class="absolute top-1/2 left-1/2 z-10 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-black dark:border-gray-950 dark:bg-gray-800"
    >
      <!-- <NuxtImg
        src="/img/kv/chibi-2024/chibi-avatar.png"
        alt=""
        class="pointer-events-none h-full w-full select-none object-cover"
        sizes="100px"
        width="100"
        height="100"
        format="webp"
        loading="lazy"
      /> -->
    </div>

    <div
      id="animate-tagline"
      class="absolute inset-0 isolate z-20 flex items-center pl-2"
    >
      <div
        class="absolute inset-0 z-0 -skew-x-12 bg-white dark:bg-gray-950"
      ></div>

      <div class="relative z-10 flex items-center -space-x-3">
        <Tagline class="h-12 text-black dark:text-white" />
        <!-- <NuxtImg
          src="/img/kv/chibi-2024/chibi-flying.png"
          alt=""
          class="pointer-events-none h-20 w-auto -scale-x-100 select-none"
          sizes="100px"
          width="827"
          height="1000"
          format="webp"
          loading="lazy"
        /> -->
      </div>
    </div>
  </div>
</template>

<script setup>
onMounted(() => {
  const { $gsap: gsap } = useNuxtApp();

  const ctx = gsap.context(() => {
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "center 45%",
        end: "bottom 20%",
        scrub: 1,
        // markers: true,
        toggleActions: "play pause resume reset",
      },
    });

    tl.to("#animate-tagline", {
      xPercent: 100,
      // x: -180,
    });
  });

  onUnmounted(() => {
    ctx.revert();
  });
});
</script>

<style></style>
