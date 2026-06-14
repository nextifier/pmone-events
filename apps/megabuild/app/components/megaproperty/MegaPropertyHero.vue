<template>
  <section id="mega-property-hero" class="relative isolate overflow-hidden">
    <div
      class="container-wider min-h-screen-offset grid grid-cols-1 gap-x-8 gap-y-16 py-10 sm:grid-cols-2 lg:grid-cols-12 lg:items-center"
    >
      <div
        class="flex flex-col items-center text-center sm:col-span-2 lg:col-span-6"
      >
        <div
          class="relative isolate mx-auto grid w-full max-w-2xl grid-cols-3 items-center"
        >
          <NuxtImg
            src="/img/mp-hero-2.jpg"
            alt=""
            class="relative z-10 aspect-4/3 translate-y-[10%] -rotate-6 rounded-xl ring-2 ring-white transition-transform duration-300 ease-out hover:z-30 hover:scale-125 hover:rotate-0"
            sizes="200px sm:320px"
            width="1080"
            height="810"
            loading="lazy"
            format="webp"
          />
          <NuxtImg
            src="/img/mp-hero-1.jpg"
            alt=""
            class="relative z-20 aspect-4/3 scale-110 rounded-xl shadow-2xl ring-2 ring-white transition-transform duration-300 ease-out hover:z-30 hover:scale-125 hover:rotate-0"
            sizes="200px sm:320px"
            width="1080"
            height="810"
            loading="lazy"
            format="webp"
          />
          <NuxtImg
            src="/img/mp-hero-3.jpg"
            alt=""
            class="relative z-10 aspect-4/3 translate-y-[10%] rotate-6 rounded-xl ring-2 ring-white transition-transform duration-300 ease-out hover:z-30 hover:scale-125 hover:rotate-0"
            sizes="200px sm:320px"
            width="1080"
            height="810"
            loading="lazy"
            format="webp"
          />
        </div>

        <h1 class="mt-12 flex flex-col items-center lg:mt-14">
          <span
            class="text-foreground text-3xl font-medium tracking-tighter sm:text-4xl"
            >{{ $t("megaProperty.hero.title1") }}</span
          >
          <span
            class="gradient-accent bg-clip-text text-5xl font-bold tracking-tighter text-transparent! sm:text-8xl"
            >{{ $t("megaProperty.hero.title2") }}</span
          >
        </h1>

        <p
          class="mt-4 max-w-xl text-base tracking-tight text-pretty sm:text-lg"
        >
          {{ $t("megaProperty.hero.description") }}
        </p>

        <div class="mt-6 flex gap-2 md:flex-wrap md:gap-3">
          <nuxt-link
            :to="localePath('/ticket')"
            class="bg-primary text-primary-foreground hover:bg-primary/80 flex items-center justify-center rounded-xl px-4 py-3 font-semibold tracking-tight transition active:scale-95 lg:rounded-2xl lg:px-6 lg:py-3"
            v-ripple
            >{{ $t("megaProperty.hero.ctaTicket") }}</nuxt-link
          >

          <nuxt-link
            :to="localePath('/book-space')"
            class="bg-primary/5 hover:bg-primary/10 dark:bg-primary/8 text-primary dark:border-primary/8 dark:hover:bg-primary/16 flex items-center justify-center rounded-xl border border-transparent px-4 py-3 font-semibold tracking-tight backdrop-blur-lg transition active:scale-95 lg:rounded-2xl lg:px-6 lg:py-3"
            v-ripple
            >{{ $t("megaProperty.hero.ctaExhibit") }}</nuxt-link
          >
        </div>
      </div>

      <div
        class="flex flex-col items-center justify-center self-end overflow-hidden text-center sm:items-start sm:text-left lg:order-first lg:col-span-3"
      >
        <p
          class="text-foreground text-2xl font-medium tracking-tight text-balance"
        >
          {{ $t("megaProperty.hero.tagline") }}
        </p>

        <MegapropertyMegaPropertyInConjunction
          v-if="event?.inConjunction?.list?.length"
          class="mt-3 flex flex-col items-center text-center sm:items-start sm:text-left"
        />
      </div>

      <div
        class="relative isolate z-10 flex flex-col items-center gap-y-4 self-end text-center md:items-end md:text-right lg:col-span-3"
      >
        <div
          class="text-primary relative z-20 flex h-full w-full flex-col items-center text-center md:items-end md:text-right"
        >
          <span
            class="relative isolate flex flex-col items-center text-7xl !leading-[0.9] font-semibold tracking-tighter text-balance uppercase md:items-end 2xl:text-8xl"
          >
            <span>{{ event.dateOnly }}</span>
            <span
              class="before:gradient-accent relative text-white before:absolute before:-inset-2 before:z-[-1] before:-skew-x-16"
              >{{ event.month }}</span
            >
            <span>{{ event.year }}</span>
          </span>
          <nuxt-link
            :to="event.locationLink ?? ''"
            target="_blank"
            class="mt-4 text-xl font-semibold tracking-tighter text-balance decoration-dotted underline-offset-4 hover:underline"
            >{{ event.location }}</nuxt-link
          >
          <span
            v-if="event.hall"
            class="mt-2 line-clamp-1 text-sm tracking-tight"
            >{{ event.hall }}</span
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const event = useEvent();
const localePath = useLocalePath();
</script>
