<template>
  <section
    id="icgp-join-for-event-organizer"
    class="px-1.5 sm:container sm:px-0"
    :class="{
      'pt-36 lg:pt-48': route.name == 'icgp',
    }"
  >
    <div
      class="relative flex flex-col items-center rounded-3xl bg-black px-4 text-white sm:px-8 lg:rounded-[48px] lg:px-12 dark:bg-gray-900 dark:text-white"
      :class="route.name === 'icgp' ? 'pb-16' : 'pb-32'"
    >
      <div
        id="icgp-mascot-img-wrapper"
        class="relative -mt-16 -mb-[140px] lg:-mb-[180px]"
      >
        <NuxtImg
          src="/img/mascots/mascot-clash-3.png"
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

      <InvertedBorderRadius
        location="bottom-center"
        destination="/icgp"
        v-if="route.name !== 'icgp'"
      />

      <div class="relative z-10 flex flex-col items-center text-center">
        <h2
          class="text-[2.5rem] !leading-[1.25] font-semibold tracking-[-0.06em] text-balance text-white sm:text-6xl"
        >
          Bring ICGP 2026 to Your City—Sign Up as a Regional Organizer!
        </h2>

        <p class="mt-3 max-w-screen-md text-base tracking-tight sm:text-lg">
          Are you an Event Organizer passionate about cosplay and ready to take
          part in the biggest national competition? Indonesia Anime Con is now
          accepting proposals from Event Organizers to conduct the ICGP 2026
          Regional Preliminary Selection!
        </p>

        <p class="mt-3 tracking-tight">Deadline: November 21, 2025</p>

        <div
          class="mt-6 flex flex-col items-center justify-center gap-y-6 lg:mt-8"
        >
          <nuxt-link
            to="mailto:icc@panoramamedia.co.id?subject=Apply for ICGP 2025 Regional Preliminary Selection"
            class="hover:bg-opacity-80 flex items-center justify-center rounded-full bg-white p-4 text-center font-medium tracking-tight text-black transition active:scale-95"
            v-ripple
            >Apply</nuxt-link
          >

          <nuxt-link
            to="mailto:icc@panoramamedia.co.id?subject=Apply for ICGP 2025 Regional Preliminary Selection"
            class="text-center font-medium tracking-tight text-gray-300 transition hover:text-white"
            v-ripple
            >or send your proposal to icc@panoramamedia.co.id</nuxt-link
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const route = useRoute();

// onMounted(() => {
//   const { $gsap: gsap } = useNuxtApp();

//   const ctx = gsap.context(() => {
//     let tl = gsap.timeline({
//       scrollTrigger: {
//         trigger: "#icgp-join-for-event-organizer",
//         start: "top 50%",
//         end: "bottom bottom",
//         scrub: 1,
//         // markers: true,
//         toggleActions: "play pause resume reset",
//       },
//     });

//     tl.from("#icgp-mascot-img-wrapper", {
//       yPercent: 100,
//       xPercent: -100,
//     });
//   });

//   onUnmounted(() => {
//     ctx.revert();
//   });
// });
</script>
