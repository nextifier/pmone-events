<template>
  <!-- <ComingSoon title="Portfolio Review" /> -->
  <div v-if="portfolioReviewList?.length" class="container">
    <h1 class="section-title text-center font-semibold">
      {{ $t("portfolioReview.title") }}
    </h1>

    <p
      class="mx-auto mt-2 max-w-3xl text-center text-base tracking-tight text-balance sm:text-lg"
    >
      {{ $t("portfolioReview.description") }}
    </p>

    <div
      class="mx-auto mt-6 grid max-w-screen-lg grid-cols-1 gap-x-4 gap-y-6 lg:mt-10 lg:grid-cols-2"
    >
      <div
        v-for="(item, index) in portfolioReviewList"
        class="@container relative isolate rounded-3xl bg-gray-50 px-6 py-6 dark:bg-gray-900"
      >
        <div>
          <div class="flex items-center gap-x-2.5">
            <nuxt-link
              :to="
                item.instagram
                  ? `https://www.instagram.com/${item.instagram}`
                  : ''
              "
              target="_blank"
              class="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full p-0.5 text-center"
              :class="
                item.instagram
                  ? 'bg-gradient-to-tr from-yellow-300 via-red-500 to-fuchsia-600'
                  : 'bg-white'
              "
            >
              <NuxtImg
                v-if="item.logo"
                :src="item.logo"
                class="h-full w-full rounded-full border-2 border-gray-100 bg-white object-contain dark:border-gray-900"
                sizes="150px"
                :alt="item.name"
                width="150"
                height="150"
                loading="lazy"
              />

              <span
                v-else
                class="line-clamp-2 flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-white text-xs !leading-[1.2] text-black dark:border-gray-950"
                >{{ item.name }}</span
              >
            </nuxt-link>

            <div class="flex flex-col items-start gap-y-1">
              <div
                class="line-clamp-2 !leading-[1.4] font-semibold tracking-tight text-black dark:text-white"
              >
                {{ item.name }}
              </div>

              <div
                v-if="item.status"
                class="flex items-center gap-x-1.5 text-xs"
              >
                <span class="relative flex aspect-square w-2">
                  <span
                    class="animate-ping-slow absolute inline-flex h-full w-full rounded-full opacity-75"
                    :class="{
                      'bg-green-500':
                        item.status.toLocaleLowerCase() == 'available',
                      'bg-yellow-400':
                        item.status.toLocaleLowerCase() == 'coming soon',
                      'bg-red-500':
                        item.status.toLocaleLowerCase() == 'sold out',
                    }"
                  ></span>
                  <span
                    class="relative inline-flex aspect-square w-2 rounded-full"
                    :class="{
                      'bg-green-500':
                        item.status.toLocaleLowerCase() == 'available',
                      'bg-yellow-400':
                        item.status.toLocaleLowerCase() == 'coming soon',
                      'bg-red-500':
                        item.status.toLocaleLowerCase() == 'sold out',
                    }"
                  ></span>
                </span>
                <span class="tracking-tight">{{ item.status }}</span>

                <span
                  v-if="
                    (item.starts_in && item.showStartCountdownLabel) ||
                    (item.ends_in && item.showEndCountdownLabel)
                  "
                  class="h-1.5 w-px bg-gray-300 dark:bg-gray-700"
                ></span>

                <div
                  v-if="
                    (item.starts_in && item.showStartCountdownLabel) ||
                    (item.ends_in && item.showEndCountdownLabel)
                  "
                >
                  <span
                    v-if="item.starts_in && item.showStartCountdownLabel"
                    class="text-xs tracking-tight"
                  >
                    <Countdown
                      :textBeforeCountdown="$t('ui.startsIn')"
                      :countdownDate="new Date(item.starts_in)"
                      v-tippy="
                        $dayjs(item.starts_in).format(
                          'MMMM D, YYYY [at] h:mm A',
                        )
                      "
                  /></span>

                  <span
                    v-if="item.ends_in && item.showEndCountdownLabel"
                    class="text-xs tracking-tight"
                    v-tippy="
                      $dayjs(item.ends_in).format('MMMM D, YYYY [at] h:mm A')
                    "
                  >
                    <Countdown
                      :textBeforeCountdown="$t('ui.endsIn')"
                      :countdownDate="new Date(item.ends_in)"
                  /></span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 w-[calc(100%-64px)]">
            <span class="!leading-normal tracking-tight">
              {{ $t("portfolioReview.openFor") }}
            </span>
            <ul class="mt-1 list-inside list-disc tracking-tight">
              <li v-for="(position, index) in item.openFor" :key="index">
                {{ position }}
              </li>
            </ul>
          </div>
        </div>

        <InvertedBorderRadius
          location="bottom-right"
          :buttonColor="item.disableLink ? 'disabled' : 'blue'"
          :destination="item.disableLink ? '' : item.button_url"
          :isExternalLink="item.openInNewTab ? true : false"
          @click="
            item.disableLink
              ? toast(
                  item.status.toLowerCase() == 'coming soon'
                    ? 'Sabar ya, pendaftaran portfolio review akan segera dibuka 🤩'
                    : 'Sorry, pendaftaran sudah ditutup 🥲',
                )
              : ''
          "
        >
          <span class="font-semibold tracking-tight text-white">{{
            item.button_label
          }}</span>
        </InvertedBorderRadius>
      </div>

      <div
        class="@container relative isolate rounded-3xl bg-gray-50 px-6 py-8 dark:bg-gray-900"
      >
        <h3
          class="text-base font-semibold tracking-tight text-black sm:text-lg dark:text-white"
        >
          {{ $t("portfolioReview.notes") }}
        </h3>
        <ol class="mt-2 list-decimal space-y-1.5 pl-4 sm:space-y-2">
          <li
            v-for="(item, index) in notes"
            :key="index"
            v-html="item"
            class="tracking-tight"
          ></li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toast } from "vue-sonner";
const event = useAppConfig().event;

const portfolioReviewList = ref([
  // {
  //   name: "Portfolio Review by RE:ON",
  //   logo: "/img/programs/portfolio-review/reoncomics.jpg",
  //   instagram: "reoncomics",
  //   openFor: ["Freelance Comic Artist", "Line Artist", "Colorist"],
  //   starts_in: new Date("Nov 4, 2024 10:00:00"),
  //   ends_in: new Date("Nov 8, 2024 23:59:59"),
  //   showStartCountdownLabel: false,
  //   showEndCountdownLabel: false,
  //   status: "Coming soon", // Coming Soon, Available, Closed
  //   label: "Registration",
  //   disableLink: true,
  //   button_label: "Join",
  //   button_url: "https://forms.gle/QWqqNZJbP5fQQhgw8",
  //   openInNewTab: true,
  // },
  // {
  //   name: "Portfolio Review by Suka Studio",
  //   logo: "/img/programs/portfolio-review/sukastudio.jpg",
  //   instagram: "sukastudio",
  //   openFor: ["Art Director", "Illustrator", "Intern Animator"],
  //   starts_in: new Date("Nov 4, 2024 10:00:00"),
  //   ends_in: new Date("Nov 8, 2024 23:59:59"),
  //   showStartCountdownLabel: false,
  //   showEndCountdownLabel: false,
  //   status: "Coming soon", // Coming Soon, Available, Closed
  //   label: "Registration",
  //   disableLink: true,
  //   button_label: "Join",
  //   button_url: "https://forms.gle/P4YcWWXfc1v1uaq7A",
  //   openInNewTab: true,
  // },
  // {
  //   name: "Portfolio Review by Beyondtopia",
  //   logo: "/img/programs/portfolio-review/beyondtopia.jpg",
  //   instagram: "beyondtopia",
  //   openFor: [
  //     "Assistant Colorist",
  //     "Cartoon Style Artist",
  //     "Toy Artist / Designer",
  //   ],
  //   starts_in: new Date("Nov 4, 2024 10:00:00"),
  //   ends_in: new Date("Nov 8, 2024 23:59:59"),
  //   showStartCountdownLabel: false,
  //   showEndCountdownLabel: false,
  //   status: "Coming soon", // Coming Soon, Available, Closed
  //   label: "Registration",
  //   disableLink: true,
  //   button_label: "Join",
  //   button_url: "https://forms.gle/GVe4rsN6x1NvPRQd9",
  //   openInNewTab: true,
  // },
]);

onMounted(() => {
  setInterval(() => {
    portfolioReviewList.value.forEach((item) => {
      if (
        item.starts_in &&
        item.ends_in &&
        item.status.toLowerCase() !== "closed"
      ) {
        let now = new Date();
        if (now < item.starts_in) {
          // console.log("Not started yet");
          item.disableLink = true;
          item.showStartCountdownLabel = true;
          item.showEndCountdownLabel = false;
          item.status = "Coming soon";
        } else if (item.starts_in < now && now < item.ends_in) {
          // console.log("Has been started");
          item.disableLink = false;
          item.showStartCountdownLabel = false;
          item.showEndCountdownLabel = true;
          item.status = "Available";
        } else if (item.ends_in < now) {
          // console.log("Has been ended");
          item.disableLink = true;
          item.showStartCountdownLabel = false;
          item.showEndCountdownLabel = false;
          item.status = "Closed";
        }
      }
    });
  }, 1000);
});

const { t } = useI18n();
const notes = computed(() => [
  t("portfolioReview.noteVenue", { appName: useAppConfig().app.name, eventDate: event.date, eventLocation: event.location }),
  t("portfolioReview.noteContact"),
]);
</script>
