<template>
  <section id="cta">
    <div class="container">
      <div
        class="flex flex-col gap-x-6 gap-y-16 lg:flex-row lg:justify-between xl:gap-x-10"
      >
        <div class="flex flex-col items-center gap-y-4 lg:items-start">
          <div class="relative isolate w-full">
            <NuxtImg
              src="/img/review-img.png"
              alt=""
              class="pointer-events-none relative z-10 size-full origin-bottom-right scale-110 rounded-4xl object-contain select-none"
              sizes="100vw lg:1600px"
              width="1600"
              height="1600"
              loading="lazy"
              format="webp"
            />
            <div
              class="bg-muted absolute inset-x-0 bottom-0 z-0 h-[90%] rounded-4xl"
            ></div>

            <div class="xs:p-4 absolute inset-x-0 bottom-0 z-30 flex">
              <div
                v-if="useContentStore().components.socialProof?.length"
                class="xs:w-auto bg-background/50 border-border xs:p-3 grid w-full grid-cols-2 gap-x-3 rounded-3xl border p-2 backdrop-blur-xl"
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
                      class="text-primary items-center text-xs tracking-tight"
                      ><span class="text-primary text-xl font-semibold">{{
                        item.rating
                      }}</span
                      >/5</span
                    >
                  </div>

                  <div class="inline-flex items-center gap-x-1">
                    <span class="text-primary xs:text-sm text-xs tracking-tight"
                      >{{ item.totalReviews }} reviews on {{ item.name }}</span
                    >
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-start text-left">
            <h2
              class="text-primary relative isolate text-[clamp(3rem,15vw,7rem)] !leading-[1.1] font-extrabold tracking-tighter text-balance"
            >
              <SplitText
                splitType="words"
                ease="power4.out"
                :delay="100"
                :duration="1.5"
                :text="`
                <span>Beneran seru gak sih di CampX?</span>
              `"
                class="pb-2 sm:pb-5"
              />
            </h2>
            <p
              class="text-primary/80 mt-1 max-w-2xl text-base tracking-tight text-pretty sm:text-lg"
            >
              Ratusan tamu sudah berbagi pengalaman seru mereka di CampX. Lihat
              langsung review dan rating CampX di Google dan TikTok biar makin
              yakin!
            </p>

            <div
              v-if="useContentStore().components.socialProof?.length"
              class="xs:w-auto mt-4 flex w-full items-center gap-2 lg:mt-6"
            >
              <NuxtLink
                v-for="(item, index) in useContentStore().components
                  .socialProof"
                :key="index"
                :to="item.link"
                target="_blank"
                class="bg-muted hover:bg-border text-primary xs:grow-0 flex grow items-center justify-center gap-x-1.5 rounded-lg px-3 py-3 font-semibold tracking-tight transition active:scale-95 sm:px-5"
              >
                <span>{{ item.ctaLabel }}</span>
                <Icon :name="item.iconName" class="h-[1lh] shrink-0" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <div
          v-if="content.banners?.length"
          class="grid shrink-0 grid-cols-1 gap-y-8 lg:mt-[10%]"
        >
          <div
            v-for="(banner, index) in content.banners"
            :key="index"
            class="flex items-start gap-x-2.5 gap-y-4 lg:max-w-[240px] lg:flex-col"
          >
            <nuxt-link
              :to="banner.cta.link"
              :target="banner.cta.link.startsWith('http') ? '_blank' : ''"
              class="lg:shadow-wrapper aspect-4/5 min-w-24 rounded-xl transition duration-500 sm:rounded-2xl lg:w-full lg:hover:rotate-6"
            >
              <NuxtImg
                v-if="banner.image"
                :src="banner.image"
                :alt="banner.title"
                class="bg-muted border-border size-full rounded-lg border object-cover select-none sm:rounded-xl lg:shadow-md"
                sizes="240px"
                width="1080"
                height="1350"
                loading="lazy"
                format="webp"
              />
            </nuxt-link>

            <div class="flex flex-col items-start gap-y-1.5">
              <span
                v-if="banner.subtitle"
                class="text-sm font-semibold tracking-tighter text-[var(--accent-color-light)] dark:text-[var(--accent-color-dark)]"
                :style="{
                  '--accent-color-light': banner.accentColor.light,
                  '--accent-color-dark': banner.accentColor.dark,
                }"
              >
                {{ banner.subtitle }}
              </span>

              <h6
                v-if="banner.title"
                class="text-primary text-base !leading-[1.3] font-semibold tracking-tighter text-balance sm:text-lg"
              >
                {{ banner.title }}
              </h6>

              <p v-if="banner.description" class="text-sm tracking-tight">
                {{ banner.description }}
              </p>

              <nuxt-link
                v-if="banner.cta"
                :to="banner.cta.link"
                :target="banner.cta.link.startsWith('http') ? '_blank' : ''"
                class="bg-border/60 text-primary hover:bg-border/80 mt-1 flex items-center justify-center gap-x-1 rounded-lg py-2 pr-2 pl-3 text-sm font-semibold tracking-tight transition active:scale-95"
                v-ripple
              >
                <span class="line-clamp-1">{{ banner.cta.label }}</span>
                <Icon name="lucide:arrow-up-right" class="size-4 shrink-0" />
              </nuxt-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const content = useContentStore().components.cta;
</script>
