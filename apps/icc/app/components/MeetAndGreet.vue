<template>
  <div
    v-if="meetAndGreetList?.length"
    class="container space-y-10 lg:space-y-16"
  >
    <div
      v-for="(category, index) in meetAndGreetList"
      :key="index"
      :id="`meet-and-greet-${category.slug}`"
    >
      <div
        v-if="
          (category.highlight && route.name !== 'programs-meet-and-greet') ||
          route.name === 'programs-meet-and-greet'
        "
      >
        <h1
          v-if="category.title"
          class="section-title text-center font-semibold"
        >
          {{ category.title }}
        </h1>

        <p
          v-if="category.description"
          class="mx-auto mt-2 max-w-3xl text-center text-base tracking-tight text-balance sm:text-lg"
        >
          {{ category.description }}
        </p>

        <div class="mt-4 flex flex-col items-center gap-y-1 text-center">
          <div
            v-if="category.status"
            class="flex items-center gap-x-1.5 text-xs sm:text-sm"
          >
            <span class="relative flex aspect-square w-2">
              <span
                class="animate-ping-slow absolute inline-flex h-full w-full rounded-full opacity-75"
                :class="{
                  'bg-green-500':
                    category.status.toLocaleLowerCase() == 'available',
                  'bg-yellow-400':
                    category.status.toLocaleLowerCase() == 'coming soon',
                  'bg-red-500': category.status.toLocaleLowerCase() == 'closed',
                }"
              ></span>
              <span
                class="relative inline-flex aspect-square w-2 rounded-full"
                :class="{
                  'bg-green-500':
                    category.status.toLocaleLowerCase() == 'available',
                  'bg-yellow-400':
                    category.status.toLocaleLowerCase() == 'coming soon',
                  'bg-red-500': category.status.toLocaleLowerCase() == 'closed',
                }"
              ></span>
            </span>
            <span class="tracking-tight">{{ category.status }}</span>
          </div>

          <span
            v-if="category.starts_in && category.showStartCountdownLabel"
            class="line-clamp-1 text-xs tracking-tight text-gray-500 sm:text-sm dark:text-gray-400"
          >
            <span>Starts in</span>&nbsp;<Countdown
              :countdownDate="category.starts_in"
            />
          </span>

          <span
            v-if="category.ends_in && category.showEndCountdownLabel"
            class="text-xs tracking-tight text-gray-500 sm:text-sm dark:text-gray-400"
          >
            <span>Ends in</span>&nbsp;<Countdown
              :countdownDate="category.ends_in"
            />
          </span>
        </div>

        <div class="@container">
          <div
            class="mt-6 grid gap-x-2 gap-y-6 lg:mt-10"
            :class="{
              'mx-auto grid-cols-1 lg:max-w-xl': category.list.length == 1,
              'grid-cols-1 lg:mx-auto lg:max-w-screen-lg @xs:grid-cols-2':
                category.list.length == 2,
              'grid-cols-1 lg:mx-auto lg:max-w-screen-lg lg:grid-cols-3 @xs:grid-cols-2':
                category.list.length == 3,
              'grid-cols-1 xl:grid-cols-4 @xs:grid-cols-2':
                category.list.length >= 4,
            }"
          >
            <div v-for="(item, index) in category.list" class="@container">
              <nuxt-link
                :to="category.disableLink ? '' : item.button_url"
                :target="category.openInNewTab ? '_blank' : ''"
                class="group relative isolate block rounded-b-full"
              >
                <div
                  v-if="item.transparentBackground"
                  class="dark:ring-kv-yellow-300 absolute inset-x-0 bottom-0 z-0 aspect-square w-full rounded-full bg-gray-100 ring-indigo-500 ring-offset-4 ring-offset-white transition duration-300 group-hover:ring-2 dark:bg-gray-900 dark:ring-offset-gray-950"
                ></div>

                <NuxtImg
                  :src="item.image"
                  :alt="item.name"
                  class="pointer-events-none relative z-10 aspect-[4/5] h-full w-full object-cover select-none"
                  :class="
                    item.transparentBackground
                      ? 'rounded-t-2xl rounded-b-full'
                      : 'rounded-2xl'
                  "
                  width="440"
                  height="550"
                  sizes="800px"
                  format="webp"
                  loading="lazy"
                />
              </nuxt-link>

              <div class="flex flex-col items-center gap-y-2 px-2 pt-3">
                <div class="flex flex-col items-center gap-y-2 text-center">
                  <span
                    class="text-base !leading-[1.4] font-semibold tracking-tight text-black @[300px]:text-xl dark:text-white"
                    >{{ item.name }}</span
                  >

                  <span
                    v-if="item.description"
                    class="!leading-[1.4] tracking-tight"
                  >
                    {{ item.description }}
                  </span>
                </div>

                <div class="w-full sm:mx-auto sm:w-max">
                  <div
                    class="flex justify-center gap-1 tracking-tight text-black dark:text-white"
                  >
                    <div
                      class="flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl bg-gray-100 px-3 py-3 text-center dark:bg-gray-900"
                    >
                      <span>{{ item.day }}</span>
                      <span>{{ item.date }}</span>
                    </div>

                    <div
                      class="flex flex-col items-center justify-center gap-0.5 rounded-2xl bg-gray-100 px-3 py-3 text-center dark:bg-gray-900"
                    >
                      <span>{{ item.time }}</span>
                    </div>
                  </div>

                  <div class="mt-2 w-full">
                    <button
                      v-if="category.disableLink"
                      @click="
                        toast(
                          category.status.toLowerCase() == 'coming soon'
                            ? 'Sabar ya, pendaftaran meet & greet akan segera dibuka 🤩'
                            : 'Sorry, pendaftaran sudah ditutup 🥲',
                        )
                      "
                      class="flex w-full cursor-not-allowed items-center justify-center gap-x-1 rounded-2xl bg-blue-600 px-4 py-3.5 text-center font-semibold tracking-tight text-white opacity-50 transition hover:bg-blue-700 active:scale-95"
                    >
                      <span>{{ category.button_label }}</span>
                    </button>
                    <nuxt-link
                      v-else
                      :to="item.button_url"
                      :target="category.openInNewTab ? '_blank' : ''"
                      class="flex w-full items-center justify-center gap-x-1 rounded-2xl bg-blue-600 px-4 py-3.5 text-center font-semibold tracking-tight text-white transition hover:bg-blue-700 active:scale-95"
                    >
                      <span>{{ category.button_label }}</span>
                    </nuxt-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          :id="`terms-${category.slug}`"
          v-if="
            route.name === 'programs-meet-and-greet' && category.terms?.length
          "
          class="pt-16 lg:pt-20"
        >
          <div
            class="mx-auto rounded-3xl bg-gray-100 px-4 py-6 sm:max-w-2xl sm:px-8 sm:py-10 dark:bg-gray-900"
          >
            <h3
              class="text-xl font-semibold tracking-tight text-black sm:text-2xl dark:text-white"
            >
              Syarat & Ketentuan {{ category.title }}:
            </h3>
            <ol class="mt-3 list-decimal space-y-1.5 pl-4 sm:space-y-2">
              <li
                v-for="(item, index) in category.terms"
                :key="index"
                v-html="item"
                class="text-black dark:text-white"
              ></li>
            </ol>
          </div>
        </div>

        <div v-else class="mt-4 flex items-center justify-center lg:mt-6">
          <nuxt-link
            :to="`/meet-and-greet#terms-${category.slug}`"
            class="flex items-center justify-center gap-1.5 rounded-full px-5 py-4 tracking-tight transition hover:bg-gray-100 active:scale-95 dark:hover:bg-gray-900"
          >
            <span>Read Terms & Conditions</span>
            <IconChevronRight class="h-3.5 shrink-0" />
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
import { toast } from "vue-sonner";
const meetAndGreetList = ref([
  {
    name: "Square Enix",
    slug: "square-enix",
    highlight: true,
    title: "Meet and Greet Square Enix",
    description:
      "Meet Motomu Toriyama (Co-Director of Final Fantasy VII Rebirth) and Teruki Endo (Battle Director of Final Fantasy VII Rebirth) and have a chance to get their autograph and take a photo with them.",
    starts_in: new Date("Jun 10, 2024 10:00:00"),
    ends_in: new Date("Jun 13, 2024 23:59:59"),
    showStartCountdownLabel: false,
    showEndCountdownLabel: false,
    status: "Coming soon", // Coming Soon, Available, Closed
    label: "Registration",
    disableLink: true,
    button_label: "Join the Fun",
    openInNewTab: true,
    list: [
      {
        name: "Square Enix 15 June",
        description:
          "Meet & Greet and Signing Session with Motomu Toriyama and Teruki Endo from Square Enix",
        image: "/img/meet-and-greet/square-enix-mng-15-june.jpg",
        transparentBackground: false,
        day: "Sat",
        date: "15 June",
        time: "15:00 - 16:00",
        button_url: "https://forms.gle/UP2dUMtnvDB7GNxQ7",
      },
      {
        name: "Square Enix 16 June",
        description:
          "Meet & Greet, Signing Session, and Photo Op with Motomu Toriyama and Teruki Endo from Square Enix",
        image: "/img/meet-and-greet/square-enix-mng-16-june.jpg",
        transparentBackground: false,
        day: "Sun",
        date: "16 June",
        time: "15:00 - 16:00",
        button_url: "https://forms.gle/UP2dUMtnvDB7GNxQ7",
      },
    ],
    terms: [
      `Pendaftaran bersifat raffle, <strong>hanya peserta terpilih yang berkesempatan membeli tiket</strong> meet and greet.`,
      `Harga tiket meet and greet Rp250.000 per sesi untuk tanggal 15 Juni yang termasuk Meet & Greet dan Signing Session, dan Rp275.000 untuk tanggal 16 Juni yang termasuk Meet & Greet, Signing Session, dan Photo Opportunity. Harga tersebut belum termasuk tiket masuk.`,
      `Peserta <strong>wajib membeli tiket masuk</strong> untuk mengikuti sesi meet and greet.`,
      `Berlaku untuk 1 orang per sesi dan tidak dapat dipindahtangankan.`,
      `Setiap sesi berlangsung secara private, selama 3 menit.`,
      `Peserta <strong>tidak diperbolehkan untuk mendokumentasikan sesi meet and greet</strong> baik dalam bentuk audio, foto, maupun video.`,
      `Pendaftaran dibuka mulai tanggal 10-13 Juni 2024.`,
      `<strong>Peserta terpilih akan dihubungi oleh tim Indonesia Comic Con</strong> untuk menjadwalkan sesi dan membantu proses pembayaran sesi meet and greet.`,
      `Antrean akan dimulai 20 menit sebelum meet and greet. Peserta yang terlambat tidak akan dilayani dan tidak akan mendapatkan pengembalian biaya sesi tersebut.`,
      `Indonesia Comic Con <strong>tidak menoleransi pelecehan dalam bentuk apa pun</strong>. Jika terjadi pelanggaran, pihak Indonesia Comic Con berhak untuk membatalkan sesi meet and greet tanpa melakukan pengembalian biaya sesi tersebut.`,
      `Peserta wajib mendaftarkan diri dengan nama lengkap serta melakukan pembayaran dengan nama rekening yang sesuai dengan Kartu Tanda Penduduk (KTP).`,
    ],
  },

  {
    name: "hololive",
    slug: "hololive",
    highlight: false,
    title: "Meet and Greet hololive",
    description:
      "Join the Meet & Greet at Indonesia Comic Con for exclusive opportunities to interact with your favorite idol.",
    starts_in: new Date("Jun 1, 2024 12:00:00"),
    ends_in: new Date("Jun 5, 2024 23:59:59"),
    showStartCountdownLabel: false,
    showEndCountdownLabel: false,
    status: "Coming soon", // Coming Soon, Available, Closed
    label: "Registration",
    disableLink: true,
    button_label: "Join the Fun",
    openInNewTab: true,
    list: [
      {
        name: "Vestia Zeta",
        image: "/img/guests/vestia-zeta.png",
        transparentBackground: true,
        day: "Sat",
        date: "15 June",
        time: "11:00 - 12:30",
        button_url: "https://forms.gle/NBLnSHf2rLBnsQwZ9",
      },
      {
        name: "Ayunda Risu",
        image: "/img/guests/ayunda-risu.png",
        transparentBackground: true,
        day: "Sat",
        date: "15 June",
        time: "12:30 - 14:00",
        button_url: "https://forms.gle/7BatUzYFAuJ8XDps9",
      },
      {
        name: "Pavolia Reine",
        image: "/img/guests/pavolia-reine.png",
        transparentBackground: true,
        day: "Sun",
        date: "16 June",
        time: "11:00 - 12:30",
        button_url: "https://forms.gle/FBjfE1LJ4kBFCPZk6",
      },
      {
        name: "Moona Hoshinova",
        image: "/img/guests/moona-hoshinova.png",
        transparentBackground: true,
        day: "Sun",
        date: "16 June",
        time: "12:30 - 14:00",
        button_url: "https://forms.gle/VHLqWa656upFhwJY6",
      },
    ],
    terms: [
      `Pendaftaran bersifat raffle, <strong>hanya peserta terpilih yang berkesempatan membeli tiket</strong> meet and greet.`,
      `Harga tiket meet and greet Rp495.000,- per sesi dan belum termasuk tiket masuk.`,
      `Peserta <strong>wajib membeli tiket masuk</strong> untuk mengikuti sesi meet and greet.`,
      `Berlaku untuk 1 orang per sesi dan tidak dapat dipindahtangankan.`,
      `Setiap sesi berlangsung secara private, selama 3 menit.`,
      `Peserta <strong>tidak diperbolehkan untuk mendokumentasikan sesi meet and greet</strong> baik dalam bentuk audio, foto, maupun video.`,
      `Pendaftaran dibuka mulai tanggal 1-5 Juni 2024.`,
      `<strong>Peserta terpilih akan dihubungi oleh tim Indonesia Comic Con</strong> untuk menjadwalkan sesi dan membantu proses pembayaran sesi meet and greet.`,
      `Antrean akan dimulai 20 menit sebelum meet and greet. Peserta yang terlambat tidak akan dilayani dan tidak akan mendapatkan pengembalian biaya sesi tersebut.`,
      `Indonesia Comic Con <strong>tidak menoleransi pelecehan dalam bentuk apa pun</strong>. Jika terjadi pelanggaran, pihak Indonesia Comic Con berhak untuk membatalkan sesi meet and greet tanpa melakukan pengembalian biaya sesi tersebut.`,
      `Peserta wajib mendaftarkan diri dengan nama lengkap serta melakukan pembayaran dengan nama rekening yang sesuai dengan Kartu Tanda Penduduk (KTP).`,
    ],
  },
]);

onMounted(() => {
  setInterval(() => {
    meetAndGreetList.value.forEach((item) => {
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
</script>
