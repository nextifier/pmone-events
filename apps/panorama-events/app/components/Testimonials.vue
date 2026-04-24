<template>
  <section id="testimonials">
    <div class="container flex flex-col items-center text-center">
      <!-- <span>
        <span class="text-gradient-accent tracking-wide uppercase"
          >Testimonials</span
        >
        ✨
      </span> -->
      <h2 class="section-title mt-2.5">
        We have worked with thousands of
        <span class="text-gradient-accent">amazing people</span>
      </h2>
    </div>

    <Marquee
      class="mt-10 [--duration:100s]"
      :reverse="false"
      :style="{
        '--gap': '8px',
      }"
    >
      <div v-for="(item, index) in items" :key="index">
        <div
          class="bg-muted/50 flex h-full w-[320px] flex-col items-start rounded-3xl px-6 py-10"
        >
          <p class="leading-normal tracking-tight">{{ item.text }}</p>
          <div class="mt-4 flex gap-0.5">
            <IconStarBold
              v-for="index in 5"
              :key="index"
              class="h-5 text-yellow-400"
            />
          </div>
          <p class="text-primary mt-2 font-semibold tracking-tight">
            {{ item.name }}
          </p>
        </div>
      </div>
    </Marquee>

    <!-- <Swiper
      id="testimonials-slider"
      class="slider-with-margin-on-first-and-last-item mt-6 w-full rounded-2xl !pb-14"
      :modules="[
        SwiperMousewheel,
        SwiperPagination,
        SwiperNavigation,
        SwiperFreeMode,
      ]"
      :pagination="{
        clickable: true,
        dynamicBullets: true,
      }"
      :navigation="{
        nextEl: '.btn-next-testimonials',
        prevEl: '.btn-prev-testimonials',
      }"
      slidesPerView="auto"
      :spaceBetween="0"
      :grabCursor="true"
      :mousewheel="{
        forceToAxis: true,
      }"
      :freeMode="true"
      :touchStartPreventDefault="false"
    >
      <SwiperSlide
        v-for="(item, index) in items"
        :key="index"
        class="relative !h-auto"
      >
        <div
          class="flex flex-col items-start rounded-3xl bg-gray-50 px-6 py-10 dark:bg-gray-900"
        >
          <p class="!leading-1.5 tracking-tight">{{ item.text }}</p>
          <div class="mt-4 flex gap-0.5">
            <IconStarBold
              v-for="index in 5"
              :key="index"
              class="h-6 text-yellow-400"
            />
          </div>
          <p class="mt-2 font-semibold text-black dark:text-white">
            {{ item.name }}
          </p>
        </div>
      </SwiperSlide>
    </Swiper>

    <div class="container mt-4 hidden sm:block">
      <div class="flex items-center justify-end gap-x-2">
        <button
          class="btn-prev-testimonials hidden aspect-square h-16 items-center justify-center rounded-full bg-gray-100 transition active:scale-95 lg:flex dark:bg-gray-900"
          aria-label="previous"
        >
          <IconChevronLeft class="h-4" />
        </button>

        <button
          class="btn-next-testimonials hidden aspect-square h-16 items-center justify-center rounded-full bg-gray-100 transition active:scale-95 lg:flex dark:bg-gray-900"
          aria-label="next"
        >
          <IconChevronRight class="h-4" />
        </button>
      </div>
    </div> -->
  </section>
</template>

<script setup>
const items = ref([
  {
    text: "Panorama Events made our corporate gathering truly remarkable. Their attention to detail and seamless execution surpassed our expectations.",
    name: "Rini Susanti",
  },
  {
    text: "Thank you, Panorama Events, for organizing our conference flawlessly. Your professionalism and dedication made our event a great success.",
    name: "Budi Cahyono",
  },
  {
    text: "Panorama Events transformed our team-building outing into an unforgettable experience. Highly recommend their services!",
    name: "Lia Wijaya",
  },
  {
    text: "We entrusted Panorama Events with our holiday party, and they delivered beyond our imagination. Kudos to their amazing team!",
    name: "Sinta Pratiwi",
  },
  {
    text: "Panorama Events handled our corporate seminar with precision and creativity. Their expertise truly shone through in every aspect of the event.",
    name: "Hendri Kusuma",
  },
  {
    text: "We had a fantastic experience working with Panorama Events for our gala dinner. Their dedication and professionalism were truly commendable.",
    name: "Fitri Indah",
  },
  {
    text: "Panorama Events exceeded our expectations in organizing our corporate outing. Their attention to detail and commitment to excellence were outstanding.",
    name: "Andi Nugroho",
  },
  {
    text: "Thank you to the team at Panorama Events for making our conference a huge success. Their seamless execution and creativity were unparalleled.",
    name: "Dewi Sari",
  },
  {
    text: "Panorama Events went above and beyond in planning our team-building event. Their innovative ideas and flawless execution made it a memorable experience.",
    name: "Rizki Firmansyah",
  },
  {
    text: "We are extremely satisfied with Panorama Events' services for our holiday party. Their professionalism and creativity truly impressed us.",
    name: "Anita Pramudita",
  },
]);
</script>

<!-- <style scoped>
#testimonials-slider {
  .swiper-slide {
    @apply w-[280px] rounded-2xl lg:w-[320px];

    &:not(:first-child) {
      @apply ml-2;
    }
  }
}
</style> -->
