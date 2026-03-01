<template>
  <section class="pt-16">
    <div class="container">
      <div class="flex flex-col items-center text-center">
        <div
          class="mb-10 flex h-24 items-center gap-x-4 lg:h-32"
          v-if="route.name !== 'icgp'"
        >
          <LogoIcgp class="h-full w-auto text-black dark:text-white" />
          <NuxtImg
            src="/img/logo/logo-wcs-indonesia.svg"
            class="pointer-events-none h-full w-auto select-none"
            width="742"
            height="642"
            loading="lazy"
          />
        </div>

        <div v-else class="relative isolate z-0 -mb-[100px] lg:-mb-[160px]">
          <NuxtImg
            src="/img/mascots/mascot-clash.png"
            class="pointer-events-none h-auto w-[200px] select-none lg:w-[320px]"
            sizes="600px"
            width="818"
            height="1200"
            loading="lazy"
            format="webp"
          />

          <div
            class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white dark:from-gray-950"
          ></div>
        </div>

        <h2 class="section-title relative z-10">
          <span class="3xl:text-6xl text-4xl lg:text-5xl"></span>
          {{ $t("icgp.citiesTitle") }}
          <span class="3xl:text-6xl text-4xl lg:text-5xl"></span>
        </h2>

        <p class="relative z-10 mt-3 text-base tracking-tight sm:text-lg">
          {{ $t("icgp.citiesDescription") }}
        </p>
      </div>

      <div
        class="mt-6 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-2 lg:mt-10"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="3xl:px-6 border-border bg-muted/50 flex flex-col rounded-2xl border border-dotted px-4 py-6"
        >
          <h6
            class="text-primary text-xl font-semibold tracking-tighter sm:text-2xl"
          >
            {{ item.city }}
          </h6>

          <div class="mt-2 flex flex-wrap gap-x-3 gap-y-3">
            <div
              v-if="item.date"
              class="text-foreground flex items-center gap-x-1.5 tracking-tight"
            >
              <Icon name="hugeicons:calendar-03" class="size-4 shrink-0" />
              <span class="line-clamp-1">{{ item.date }}</span>
            </div>

            <NuxtLink
              v-if="item.location"
              :to="item.location.map"
              target="_blank"
              class="text-foreground flex items-center gap-x-1.5 tracking-tight"
            >
              <Icon name="hugeicons:location-01" class="size-4 shrink-0" />
              <span class="line-clamp-1">{{ item.location.name }}</span>
            </NuxtLink>
          </div>

          <div v-if="item.judges" class="mt-2">
            <span class="text-xs tracking-tight sm:text-sm"
              >{{ item.judges.length > 1 ? $t("icgp.judges") : $t("icgp.judge") }}:

              <span v-for="(judge, index) in item.judges" :key="index">
                <!-- Case for 2 items -->
                <template v-if="item.judges.length === 2">
                  {{ judge }}
                  <span v-if="index === 0"> & </span>
                </template>

                <!-- Case for more than 2 items -->
                <template v-else-if="item.judges.length > 2">
                  <!-- Add comma between items -->
                  <span v-if="index > 0 && index < item.judges.length - 1"
                    >,
                  </span>
                  <!-- Add ", and" before the last item -->
                  <span v-if="index === item.judges.length - 1">, and </span>
                  {{ judge }}
                </template>

                <!-- Case for single item -->
                <template v-else>
                  {{ judge }}
                </template>
              </span>
            </span>
          </div>

          <div v-if="item.organizer" class="mt-3 flex flex-col">
            <NuxtLink
              :to="`https://www.instagram.com/${item.organizer.instagram}`"
              target="_blank"
              class="flex items-center gap-x-1.5"
            >
              <div
                class="border-border bg-muted aspect-square size-10 shrink-0 overflow-hidden rounded-full border object-cover"
              >
                <NuxtImg
                  :src="item.organizer.img"
                  class="h-full w-full"
                  width="100"
                  height="100"
                  sizes="100px"
                  loading="lazy"
                  format="webp"
                />
              </div>

              <div class="flex flex-col items-start">
                <span class="text-xs tracking-tight">{{ $t("icgp.organizedBy") }}</span>
                <span
                  class="text-foreground line-clamp-1 font-semibold tracking-tight"
                  >{{ item.organizer.name }}</span
                >
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- <div
        class="mt-6 flex flex-col items-center justify-center text-center lg:mt-10"
      >
        <h2 class="section-title">Final Round of ICGP 2026</h2>

        <LogoIcgp class="my-4 max-w-[240px] text-black dark:text-white" />

        <span class="section-title">TBA</span>

        <span class="text-primary mt-3 tracking-tight"
          >TBA</span
        >

        <div class="mt-4 grid grid-cols-2 gap-2">
          <div
            class="bg-muted flex flex-col items-start gap-1 rounded-2xl px-4 py-6 text-left"
          >
            <span class="text-primary tracking-tight">21 June 2025</span>
            <span class="text-lg !leading-[1.2] font-bold tracking-tighter"
              >Costume Judging</span
            >
          </div>

          <div
            class="bg-muted flex flex-col items-start gap-1 rounded-2xl px-4 py-6 text-left"
          >
            <span class="text-primary tracking-tight">22 June 2025</span>
            <span class="text-lg !leading-[1.2] font-bold tracking-tighter"
              >Performance Judging</span
            >
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-y-1">
          <span class="text-xs tracking-tight sm:text-sm">Organized by:</span>

          <NuxtLink
            :to="`https://www.instagram.com/chibicon.id`"
            target="_blank"
            class="mt-1.5 flex items-center gap-x-1.5"
          >
            <div
              class="aspect-square size-10 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-100 object-cover sm:size-12 dark:border-gray-900 dark:bg-gray-900"
            >
              <NuxtImg
                src="/img/organizers/chibicon.id.jpg"
                class="h-full w-full"
                width="100"
                height="100"
                sizes="100px"
                loading="lazy"
                format="webp"
              />
            </div>

            <div class="flex flex-col items-start">
              <span
                class="line-clamp-1 font-semibold tracking-tight text-black dark:text-white"
                >ChibiCon!</span
              >
              <span class="line-clamp-1 text-xs tracking-tight sm:text-sm"
                >@chibicon.id</span
              >
            </div>
          </NuxtLink>
        </div>

        <nuxt-link
          v-if="route.name !== 'icgp'"
          to="/icgp"
          class="bg-muted text-primary hover:bg-muted/80 mt-6 flex items-center gap-x-1 rounded-full px-4 py-3 tracking-tight transition active:scale-95"
        >
          <span>More about ICGP</span>
          <IconArrowUpRight class="h-3" />
        </nuxt-link>
      </div> -->

      <!-- <div class="mt-6 flex flex-col items-center text-center lg:mt-10">
        <h2 class="section-title">Ready to compete or cheer?</h2>

        <p class="mx-auto mt-3 max-w-2xl text-base tracking-tight sm:text-lg">
          Make sure to follow the organizer’s Instagram page to catch all the
          info on ICGP registration for your city! We’ll see you at Indonesia
          Anime Con 2025 — where the ultimate winner will represent Indonesia at
          the World Cosplay Summit in Japan!
        </p>

        <nuxt-link
          v-if="route.name !== 'icgp'"
          to="/icgp"
          class="mt-6 flex items-center gap-x-1 rounded-full bg-black px-6 py-4 font-semibold tracking-tight text-white transition hover:bg-opacity-80 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-opacity-80"
        >
          <span>Learn more about ICGP</span>
          <IconArrowUpRight class="h-4" />
        </nuxt-link>
      </div> -->
    </div>
  </section>
</template>

<script setup>
const route = useRoute();
const items = ref([
  {
    city: "Yogyakarta",
    date: "1 February 2026",
    organizer: {
      name: "Neocon.ID",
      instagram: "neocon.id",
      img: "/img/organizers/neocon.id.jpg",
    },
    location: {
      name: "TBA",
      map: "",
    },
    // judges: ["Ryan Cyd", "Echow Eko", "Wawa"],
  },
  {
    city: "Denpasar",
    date: "7–8 February 2026",
    organizer: {
      name: "crehaproject",
      instagram: "crehaproject",
      img: "/img/organizers/crehaproject.jpg",
    },
    location: {
      name: "TBA",
      map: "",
    },
    // judges: ["Yumaki", "Unu", "Mamemayo"],
  },
  {
    city: "Palembang",
    date: "28–29 March 2026",
    organizer: {
      name: "Get Wealthy Soon (GWS) Team",
      instagram: "gws.x.team",
      img: "/img/organizers/gws.x.team.jpg",
    },
    location: {
      name: "TBA",
      map: "",
    },
    // judges: ["Echow Eko", "Zai Naru"],
  },
  {
    city: "Bandar Lampung",
    date: "12 April 2026",
    organizer: {
      name: "Dungeon Creative",
      instagram: "dungeoncreative",
      img: "/img/organizers/dungeoncreative.jpg",
    },
    location: {
      name: "TBA",
      map: "",
    },
    // judges: ["Yumaki", "Rian Cyd"],
  },
  {
    city: "Malang",
    date: "19 April 2026",
    organizer: {
      name: "Japan Culture Daisuki",
      instagram: "jcd.network",
      img: "/img/organizers/jcd.network.jpg",
    },
    location: {
      name: "TBA",
      map: "",
    },
    // judges: ["Echow Eko"],
  },
]);
</script>
