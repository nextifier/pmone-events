<template>
  <section id="mega-property-intro">
    <div
      class="container grid grid-cols-1 items-center gap-x-12 gap-y-6 md:grid-cols-2"
    >
      <!-- Left: Image -->
      <!-- <div class="relative">
          <div
            class="relative isolate mx-auto grid max-w-md grid-cols-3 items-center lg:max-w-none"
          >
            <NuxtImg
              src="/img/mp-hero-2.jpg"
              class="relative z-10 aspect-4/3 translate-y-[10%] -rotate-6 rounded-xl ring-2 ring-white transition-transform duration-300 ease-out hover:z-30 hover:scale-110 hover:rotate-0"
              sizes="150px sm:200px lg:250px"
              width="1080"
              height="810"
              loading="lazy"
              format="webp"
            />
            <NuxtImg
              src="/img/mp-hero-1.jpg"
              class="relative z-20 aspect-4/3 scale-110 rounded-xl shadow-2xl ring-2 ring-white transition-transform duration-300 ease-out hover:z-30 hover:scale-125"
              sizes="150px sm:200px lg:250px"
              width="1080"
              height="810"
              loading="lazy"
              format="webp"
            />
            <NuxtImg
              src="/img/mp-hero-3.jpg"
              class="relative z-10 aspect-4/3 translate-y-[10%] rotate-6 rounded-xl ring-2 ring-white transition-transform duration-300 ease-out hover:z-30 hover:scale-110 hover:rotate-0"
              sizes="150px sm:200px lg:250px"
              width="1080"
              height="810"
              loading="lazy"
              format="webp"
            />
          </div>
        </div> -->

      <NuxtImg
        src="/img/megaproperty-indonesia.jpg"
        alt="MegaProperty Indonesia exhibition showcase"
        class="bg-muted outline-inside rounded-2xl"
        width="1440"
        height="1920"
        sizes="400px sm:800px"
        format="webp"
        loading="lazy"
      />

      <!-- Right: Content -->
      <div class="flex flex-col items-start">
        <span class="text-gradient-accent font-medium tracking-tight">{{
          $t("megaProperty.subtitle")
        }}</span>

        <h2
          class="text-foreground mt-2.5 text-3xl font-semibold tracking-tighter text-balance lg:text-4xl"
          v-html="$t('megaProperty.title')"
        ></h2>

        <p class="mt-3 text-base leading-normal tracking-tight lg:text-lg">
          {{ $t("megaProperty.description") }}
        </p>

        <!-- Highlights -->
        <div class="mt-6 grid grid-cols-2 gap-x-2.5 gap-y-5 sm:gap-x-6">
          <div
            v-for="(item, index) in highlights"
            :key="index"
            class="flex items-start gap-2"
          >
            <Icon :name="item.icon" class="text-primary size-[1lh] shrink-0" />
            <span
              class="text-foreground -mt-0.5 text-base tracking-tight lg:text-lg"
              >{{ item.label }}</span
            >
          </div>
        </div>

        <NuxtLink
          :to="localePath('/megaproperty')"
          class="bg-primary text-primary-foreground hover:bg-primary/80 mt-6 flex items-center gap-x-1 rounded-lg px-4 py-2 font-medium tracking-tight transition active:scale-98"
        >
          {{ $t("megaProperty.ctaButton") }}
          <Icon name="hugeicons:arrow-right-02" class="size-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t } = useI18n();
const localePath = useLocalePath();

const highlights = computed(() => [
  { icon: "hugeicons:home-01", label: t("megaProperty.highlights[0]") },
  {
    icon: "hugeicons:user-multiple-02",
    label: t("megaProperty.highlights[1]"),
  },
  { icon: "hugeicons:mic-01", label: t("megaProperty.highlights[2]") },
  { icon: "hugeicons:bank", label: t("megaProperty.highlights[3]") },
]);
</script>
