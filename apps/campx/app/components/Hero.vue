<template>
  <section
    id="hero"
    class="from-background to-background via-accent/0 dark:via-accent/15 relative isolate bg-linear-to-b lg:bg-radial-[at_25%_25%]"
  >
    <div
      class="from-background to-background/0 absolute inset-x-0 top-0 z-0 h-[20%] bg-linear-to-b"
    ></div>
    <div
      class="from-background to-background/0 absolute inset-x-0 bottom-0 z-0 h-[20%] bg-linear-to-t"
    ></div>

    <div class="container-wider min-h-screen-offset relative z-20">
      <div
        class="min-h-screen-offset grid grid-cols-1 gap-x-6 gap-y-6 pt-12 md:grid-cols-2 md:items-center md:pt-0 xl:grid-cols-3"
      >
        <div class="3xl:gap-y-24 order-first h-full">
          <div
            class="xl:min-h-screen-offset flex flex-col items-start md:py-10 xl:justify-end"
          >
            <!-- <Announcement /> -->

            <span class="section-subtitle"
              >Pengalaman Camping & Outing Kekinian di Tepi Danau.</span
            >

            <h1
              class="text-primary 0 mt-2 text-[clamp(2.5rem,3.5vw,6rem)] !leading-[1.2] font-medium tracking-[-0.06em] text-balance"
            >
              Lepasin Penatnya Kota, Hirup Lagi Segarnya Alam.
            </h1>

            <p class="section-description mt-3">
              Di sini, alarm pagimu adalah suara alam, bukan lagi dering hape.
              Tempatmu buat istirahat, main, dan nemuin lagi energimu yang
              hilang.
            </p>

            <div class="mt-6 flex w-full flex-wrap gap-2 md:gap-3">
              <nuxt-link
                to="/#experiences"
                class="bg-primary text-primary-foreground hover:bg-primary/80 flex items-center justify-center rounded-xl px-4 py-3 font-semibold tracking-tight transition active:scale-95"
                v-ripple
                v-scroll-to="{
                  el: '#experiences',
                  offset: -56,
                }"
                >Mulai Petualanganmu</nuxt-link
              >

              <button
                @click="openContactDialog"
                class="hover:bg-primary/5 dark:hover:bg-primary/8 text-primary border-primary/8 flex items-center justify-center rounded-xl px-4 py-3 font-semibold tracking-tight transition active:scale-95"
                v-ripple
              >
                Buat Outing
              </button>
            </div>

            <div
              v-if="useContentStore().components.socialProof?.length"
              class="xs:w-auto mt-6 grid w-full grid-cols-2 gap-x-3"
            >
              <NuxtLink
                v-for="(item, index) in useContentStore().components
                  .socialProof"
                :key="index"
                :to="item.link"
                target="_blank"
                class="hover:bg-primary/5 flex flex-col gap-y-1 rounded-xl px-2 py-2 transition active:scale-95 sm:px-4"
              >
                <div class="flex items-center gap-x-2">
                  <Icon
                    :name="item.iconName"
                    class="text-primary size-4 shrink-0"
                  />
                  <IconStar class="text-primary size-4 shrink-0" />

                  <span
                    class="text-muted-foreground items-center text-xs tracking-tight"
                    ><span class="text-primary text-xl font-semibold">{{
                      item.rating
                    }}</span
                    >/5</span
                  >
                </div>

                <div class="inline-flex items-center gap-x-1">
                  <span class="text-muted-foreground text-sm tracking-tight"
                    >{{ item.totalReviews }} reviews on {{ item.name }}</span
                  >
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <div
          class="relative order-2 h-full md:order-last md:col-span-2 md:max-w-md xl:order-2 xl:col-span-1 xl:max-w-none"
        >
          <div
            @click="togglePlayPause"
            class="bg-primary/5 group relative aspect-9/16 size-full cursor-pointer overflow-hidden rounded-xl"
          >
            <video
              ref="videoRef"
              loop
              muted
              playsinline
              preload="none"
              :poster="videoPoster"
              class="size-full object-cover"
              :class="{ 'opacity-0': !isVideoLoaded }"
              @loadeddata="onVideoLoaded"
            >
              <source
                v-if="shouldLoadVideo"
                src="/video/hero-video.mp4"
                type="video/mp4"
              />
            </video>

            <!-- Poster image shown while video is loading -->
            <img
              v-if="!isVideoLoaded"
              :src="videoPoster"
              alt=""
              class="absolute inset-0 size-full object-cover"
            />

            <div
              v-if="isVideoLoaded"
              class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity pointer-fine:group-hover:opacity-100"
              :class="{ 'opacity-100!': !isPlaying }"
            >
              <div
                class="flex size-16 items-center justify-center rounded-full bg-white/30 text-white outline -outline-offset-6 outline-white transition hover:bg-white/60 active:scale-95"
              >
                <Icon
                  :name="
                    isPlaying
                      ? 'hugeicons:pause'
                      : 'hugeicons:play'
                  "
                  class="size-8"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="order-3 h-full md:order-2 md:pt-10 xl:order-last">
          <div class="relative ml-auto flex size-full flex-col gap-y-6">
            <BannerHero class="relative z-20 w-full shrink-0" />

            <div
              class="bg-muted relative isolate size-full grow overflow-hidden rounded-2xl"
            >
              <NuxtImg
                src="/img/hero-img.jpeg"
                alt=""
                class="relative z-10 size-full object-cover"
                width="400"
                height="600"
                sizes="100vw lg:600px"
                format="webp"
              />

              <div
                class="absolute inset-x-0 bottom-0 z-20 flex h-1/2 flex-col justify-end bg-linear-to-t from-black/60 to-transparent px-6 pb-10"
              >
                <span
                  class="text-4xl !leading-[1.2] font-semibold tracking-tighter text-white text-shadow-md sm:text-5xl"
                  >Lupain To-Do List, Ingat Lagi Caranya Bengong.</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const uiStore = useUiStore();
const openContactDialog = () => {
  uiStore.openContactDialog();
};

const videoRef = ref(null);
const isPlaying = ref(false);
const isManuallyPaused = ref(false);
const shouldLoadVideo = ref(false);
const isVideoLoaded = ref(false);
const videoPoster = "/video/hero-video-poster.jpg";

let observer = null;

const onVideoLoaded = () => {
  isVideoLoaded.value = true;
};

const togglePlayPause = () => {
  const video = videoRef.value;
  if (!video) return;

  if (video.paused) {
    video.play();
    isPlaying.value = true;
    isManuallyPaused.value = false;
  } else {
    video.pause();
    isPlaying.value = false;
    isManuallyPaused.value = true;
  }
};

onMounted(() => {
  const options = {
    root: null,
    rootMargin: "50px", // Start loading slightly before entering viewport
    threshold: 0.1,
  };

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = videoRef.value;
      if (!video) return;

      if (entry.isIntersecting) {
        // Lazy load: set source when video enters viewport
        if (!shouldLoadVideo.value) {
          shouldLoadVideo.value = true;
          // Wait for source to be added, then load and play
          nextTick(() => {
            video.load();
            if (!isManuallyPaused.value) {
              video.play().catch((e) => {
                // Autoplay might be blocked, that's okay
                console.debug("Video autoplay prevented:", e.message);
              });
              isPlaying.value = true;
            }
          });
        } else if (!isManuallyPaused.value) {
          video
            .play()
            .catch((e) => console.debug("Video play prevented:", e.message));
          isPlaying.value = true;
        }
      } else {
        video.pause();
        isPlaying.value = false;
      }
    });
  }, options);

  if (videoRef.value) {
    observer.observe(videoRef.value);
  }
});

onUnmounted(() => {
  if (observer && videoRef.value) {
    observer.unobserve(videoRef.value);
  }
});
</script>
