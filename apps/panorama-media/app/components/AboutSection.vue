<template>
  <section id="about">
    <div class="container">
      <div
        class="grid grid-cols-1 gap-x-4 gap-y-3.5 lg:grid-cols-12 lg:items-start"
      >
        <div class="flex flex-col items-start gap-y-3 lg:col-span-7">
          <h2 class="section-title">
            Events are our language. Connections are our purpose.
          </h2>
        </div>

        <div
          class="flex flex-col items-start gap-y-5 lg:col-span-5 lg:ml-auto lg:max-w-xl lg:items-end lg:text-right"
        >
          <p class="section-description">
            Every event has the potential to be a special moment. An exhibition
            where visitors gain new insights. A festival where friends gather. A
            corporate gathering that brings teams closer.
          </p>
          <p class="section-description text-balance!">
            We believe great events aren't the grandest ones. They're the ones
            that send people home smiling.
          </p>
        </div>
      </div>

      <div
        class="mt-8 grid grid-cols-1 gap-x-3 gap-y-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="bg-muted/50 flex flex-col rounded-3xl px-8 py-8"
        >
          <NuxtImg
            :src="item.img"
            :alt="item.title"
            class="pointer-events-none w-full select-none dark:contrast-80 dark:invert"
            width="400"
            height="400"
            loading="lazy"
          />
          <div class="flex flex-col gap-y-1.5">
            <h6
              class="text-primary text-xl leading-[1.25]! font-medium tracking-tighter sm:text-2xl"
            >
              {{ item.title }}
            </h6>
            <p class="tracking-tight">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <div class="mt-8 flex items-center justify-center">
        <NuxtLink
          to="/about"
          class="bg-muted hover:bg-primary hover:text-primary-foreground text-primary border-border flex items-center justify-center gap-x-1 rounded-xl border px-4 py-3.5 font-semibold tracking-tighter transition active:scale-98"
        >
          <span>Get to know us better</span>
          <Icon name="lucide:chevron-right" class="size-4 shrink-0" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const items = [
  {
    title: "Events that connect",
    description: "Corporate gatherings, conferences, team building.",
    img: "/img/about/events-that-connect.svg",
  },
  {
    title: "Shows that inspire",
    description: "Concerts, festivals, live entertainment.",
    img: "/img/about/shows-that-inspire.svg",
  },
  {
    title: "Expos that transform",
    description: "Industry exhibitions across 10+ sectors.",
    img: "/img/about/expos-that-transform.svg",
  },
];
</script>
