<template>
  <div v-if="guest" class="pt-6 pb-14 lg:pt-8 lg:pb-20">
    <div class="container flex items-center justify-between lg:max-w-screen-lg">
      <ButtonBack />

      <DialogShare :pageTitle="title" />
    </div>

    <div class="mt-6 sm:container lg:mt-12 lg:max-w-screen-lg">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="relative isolate aspect-[4/5] overflow-hidden">
          <NuxtImg
            :src="guest.photos[0]"
            :alt="guest.name"
            class="pointer-events-none relative z-10 h-full w-full object-cover select-none"
            :class="{ 'rounded-2xl': !guest.transparentBackground }"
            width="800"
            height="1000"
            sizes="600px"
            format="webp"
            loading="lazy"
          />

          <div
            v-if="guest.transparentBackground"
            class="absolute inset-x-0 bottom-0 z-20 h-[25%] bg-gradient-to-t from-white dark:from-gray-950"
          ></div>
        </div>

        <div
          class="flex flex-col items-center px-4 sm:px-0 lg:items-start lg:pt-10"
        >
          <h1
            class="text-center text-5xl font-semibold tracking-tighter text-black sm:text-6xl lg:text-left dark:text-white"
          >
            {{ guest.name }}
          </h1>

          <p
            v-if="guest.shortBio"
            class="mt-3 text-center text-xs tracking-tight text-gray-500 sm:text-sm lg:text-left dark:text-gray-400"
          >
            {{ guest.shortBio }}
          </p>

          <div class="mt-5 flex gap-2">
            <SocialLink
              v-if="guest.social?.website"
              :to="`https://${guest.social.website}`"
              iconName="hugeicons:globe-02"
              label="Website"
            />
            <SocialLink
              v-if="guest.social?.instagram"
              :to="`https://www.instagram.com/${guest.social.instagram}`"
              iconName="hugeicons:instagram"
              label="Instagram"
            />
            <SocialLink
              v-if="guest.social?.facebook"
              :to="`https://www.facebook.com/${guest.social.facebook}`"
              iconName="hugeicons:facebook-01"
              label="Facebook"
            />
          </div>

          <div class="mt-5 grid w-full grid-cols-2 gap-2 sm:gap-y-4">
            <div
              class="flex flex-col gap-y-2 rounded-3xl bg-indigo-600 px-4 py-6 text-white lg:px-6 lg:py-8"
            >
              <div class="flex items-center gap-x-1">
                <IconCalendar class="size-5 shrink-0" />
                <span class="tracking-tight">Appearance Date</span>
              </div>

              <div class="text-2xl font-semibold tracking-tight">
                {{
                  `${guest.appearanceDate?.date} ${guest.appearanceDate?.month}`
                }}
              </div>
            </div>

            <div
              v-if="guest.categories?.length"
              class="flex flex-col rounded-3xl bg-lime-300 px-4 py-6 text-black lg:px-6 lg:py-8"
            >
              <div class="flex items-center gap-x-1">
                <IconTag class="size-5 shrink-0" />
                <span class="tracking-tight">Category</span>
              </div>

              <div class="text-2xl font-semibold tracking-tight">
                <span v-if="guest.categories.length">{{
                  guest.categories.join(", ")
                }}</span>
                <span v-else>-</span>
              </div>
            </div>

            <nuxt-link
              v-if="guest.meetAndGreetAvailable"
              :to="localePath('/meet-and-greet')"
              class="hover:bg-opacity-80 dark:hover:bg-opacity-80 col-span-full flex items-center justify-center gap-1.5 rounded-3xl bg-black px-4 py-6 text-center text-lg font-semibold tracking-tight text-white transition sm:text-xl dark:bg-white dark:text-black"
            >
              <IconTicketStar class="h-6" />
              <span>Meet and Greet</span>
            </nuxt-link>

            <div
              v-if="guest.description"
              class="col-span-full flex flex-col gap-y-2 rounded-3xl bg-gray-100 px-4 py-6 text-base !leading-normal sm:text-lg lg:px-6 lg:py-8 dark:bg-gray-900"
              v-html="guest.description"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const localePath = useLocalePath();
const config = useRuntimeConfig();
const route = useRoute();
const guests = useGuestStore();
const guest = guests.getGuestBySlug(route.params.slug);

if (!guest) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
  });
}

const title = `Meet ${guest.name} at ${useAppConfig().event.title} on ${useAppConfig().event.date} at ${useAppConfig().event.location}`;
const description = `Meet ${guest.name} at ${useAppConfig().event.title} on ${useAppConfig().event.date} at ${useAppConfig().event.location}`;

usePageMeta("", {
  title: title,
  description: description,
});

const router = useRouter();
</script>
