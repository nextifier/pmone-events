<template>
  <section id="outing">
    <div class="container">
      <div class="flex flex-col items-center">
        <h2
          class="text-primary relative isolate text-center text-[clamp(3rem,12vw,6rem)] !leading-[1.1] font-medium tracking-tighter text-balance"
        >
          <SplitText
            splitType="words"
            ease="power4.out"
            :delay="100"
            :duration="1.5"
            :text="`
                <span>Bosan Outing di Tempat yang Gitu-Gitu Aja?</span>
              `"
            class="pb-2 sm:pb-5"
          />
        </h2>

        <div
          class="mt-4 grid max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-2"
        >
          <NuxtImg
            src="/img/outing-img.jpeg"
            class="bg-muted pointer-events-none size-full rounded-xl object-cover select-none"
            width="867"
            height="1156"
            sizes="400px sm:800px"
            loading="lazy"
            format="webp"
          />

          <div
            class="text-primary space-y-8 text-2xl !leading-[1.3] font-medium tracking-tighter sm:text-3xl"
          >
            <p>
              Tinggalkan ruang meeting dan hiruk pikuk kota. Di CampX, kami
              tawarkan pengalaman outing yang beda, di tepi danau Jatiluhur yang
              asri dan strategis, hanya 2 jam dari Jakarta.
            </p>

            <p>
              Mau fokus ke team building yang menantang, atau sekadar fun games
              dan makan bareng di alam terbuka? Semua bisa kami siapkan.
              Fasilitas lengkap, pilihan aktivitas beragam, dan pemandangan
              juara, siap bikin acaramu jadi omongan di kantor!
            </p>
          </div>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-3">
          <div
            v-for="(item, index) in features"
            :key="index"
            class="flex flex-col items-start gap-y-2"
          >
            <div
              class="border-border flex size-12 items-center justify-center rounded-2xl border"
            >
              <Icon
                v-if="item.iconName"
                :name="item.iconName"
                class="size-6 text-green-500"
              />
            </div>
            <span
              v-if="item.title"
              class="text-primary text-base font-semibold tracking-tighter sm:text-lg"
              >{{ item.title }}</span
            >
            <span v-if="item.description" class="tracking-tight">{{
              item.description
            }}</span>
          </div>
        </div>

        <nuxt-link
          :to="`https://api.whatsapp.com/send?phone=${useAppConfig().contact.whatsappOuting}&text=Hai, ${useAppConfig().app.shortName}`"
          target="_blank"
          class="bg-primary text-primary-foreground hover:bg-primary/80 mt-10 flex items-center justify-center rounded-xl px-8 py-4 font-semibold tracking-tight transition active:scale-95"
          v-ripple
        >
          Diskusi Rencana Outing
        </nuxt-link>
      </div>
    </div>
  </section>
</template>

<script setup>
const features = [
  {
    title: "Paket Fleksibel & Lengkap",
    description:
      "Dari tenda, makan, sampai fasilitator profesional, semua bisa kami siapkan sesuai bujet dan kebutuhanmu. Kamu dan tim tinggal datang bawa badan!",
    iconName: "hugeicons:user-group-02",
  },
  {
    title: "Aktivitas Seru & Bervariasi",
    description:
      "Pilih aktivitas yang paling pas untuk tim-mu, mulai dari hiking ke Tebing Boyer, kompetisi kano & paddle board, sampai sesi api unggun yang akrab di malam hari.",
    iconName: "hugeicons:workout-sport",
  },
  {
    title: "Lokasi Asri, Mudah Diakses",
    description:
      "Nikmati suasana alam yang menyegarkan tanpa harus pergi jauh. Lokasi kami mudah dijangkau dan punya semua fasilitas yang dibutuhkan untuk acara yang sukses.",
    iconName: "hugeicons:natural-food",
  },
];
</script>
