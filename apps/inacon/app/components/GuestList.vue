<template>
  <div class="relative isolate overflow-hidden">
    <!-- <KVHalftone
      class="text-primary/5 absolute inset-x-0 bottom-0 z-0 w-full xl:translate-y-[40%]"
    /> -->

    <div
      class="from-background to-background/0 absolute inset-x-0 top-0 z-0 h-[20%] bg-linear-to-b"
    ></div>
    <div
      class="from-background to-background/0 absolute inset-x-0 bottom-0 z-0 h-[20%] bg-linear-to-t"
    ></div>

    <div class="container-wider relative z-20">
      <div v-if="guests.length" class="pt-6 pb-16">
        <div class="flex flex-col items-center text-center">
          <h2
            :class="{
              'section-title': getRouteBaseName(route) === 'guests',
              'section-title-large': getRouteBaseName(route) === 'index',
              'text-primary text-3xl font-extrabold tracking-tighter sm:text-4xl':
                !['index', 'guests'].includes(getRouteBaseName(route)),
            }"
          >
            {{ $t("guests.sectionTitle") }}
          </h2>

          <p
            class="text-foreground/80 mx-auto mt-2 max-w-3xl text-center text-base tracking-tight text-balance sm:text-lg"
          >
            {{ $t("guests.sectionDescription", { eventTitle: useAppConfig().event.title }) }}
          </p>
        </div>
        <div
          class="3xl:grid-cols-5 mt-4 grid w-full grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-6 lg:mt-6 xl:grid-cols-4"
        >
          <GuestCard
            v-for="(guest, index) in guests"
            :key="index"
            :guest="guest"
          />
          <!-- <GuestComingSoonCard /> -->
        </div>
      </div>

      <div v-else class="min-h-screen-offset flex flex-col justify-center pt-6">
        <div
          class="flex flex-col items-center justify-center gap-y-3 text-center"
        >
          <h1 class="section-title-comic">Guests Coming Soon</h1>

          <p class="max-w-xl text-balance">
            Be the first to know when the lineup of amazing guests for
            {{ useAppConfig().event.title }} announced.
          </p>

          <nuxt-link
            v-if="useAppConfig().social.instagram"
            :to="`https://www.instagram.com/${useAppConfig().social.instagram}`"
            target="_blank"
            class="bg-primary text-primary-foreground hover:bg-primary/80 mt-4 flex items-center gap-x-1 rounded-xl px-4 py-3 font-medium tracking-tight transition active:scale-95"
          >
            <Icon name="hugeicons:instagram" class="size-5 shrink-0" />
            <span>Follow us on Instagram</span>
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const getRouteBaseName = useRouteBaseName();
const guests = useGuestStore().list.filter((guest) => guest.isPublished);
</script>
