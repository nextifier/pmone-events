<template>
  <section v-if="partners.length" id="credits">
    <h2 class="section-title">{{ content.title }}</h2>
    <p class="mt-3 text-base tracking-tight text-pretty sm:text-lg">
      {{ content.description }}
    </p>

    <div class="mt-10 flex w-full flex-wrap gap-x-2 gap-y-8">
      <div
        v-for="(partner, index) in partners"
        :key="index"
        class="bg-pattern-diagonal border-border relative flex grow flex-col items-center justify-center gap-y-4 rounded-xl border py-4 [--pattern-fg:var(--color-primary)]/3 sm:px-6 sm:py-6 dark:[--pattern-fg:var(--color-primary)]/10"
        :class="{
          '': partner.list.length > 1 || partner.fullWidth,
        }"
      >
        <span
          class="text-primary bg-background xs:text-sm absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-center text-xs font-semibold tracking-tighter text-nowrap"
          >{{ partner.category }}</span
        >

        <div
          class="flex w-full flex-wrap items-center justify-evenly gap-x-0 gap-y-2"
        >
          <component
            v-for="(item, index) in partner.list"
            :key="index"
            :is="item.link ? NuxtLink : 'span'"
            :to="item.link || null"
            :target="item.link ? '_blank' : null"
            class="group flex items-center justify-center rounded-xl active:scale-98 dark:hover:bg-white"
            :class="{
              'w-full max-w-48 p-3 xl:max-w-56': partner.noContainer,
              'aspect-3/2': !partner.noContainer,
              'h-20 xl:h-24': partner.list.length <= 10,
              'h-18 xl:h-20': partner.list.length > 10,
            }"
            :aria-label="item.link ? item.name || 'Partner logo' : undefined"
          >
            <img
              :src="item.img"
              :alt="item.name ?? ''"
              class="object-contain select-none dark:brightness-90 dark:contrast-200 dark:grayscale dark:invert-[75%] dark:group-hover:filter-none"
              width="300"
              height="200"
              loading="lazy"
              decoding="async"
            />
          </component>
        </div>

        <DevOnly>
          <span
            v-if="partner.list.length > 10"
            class="squircle bg-background text-muted-foreground absolute right-2.5 bottom-2.5 flex size-7 shrink-0 items-center justify-center border text-center text-xs font-semibold tracking-tight"
          >
            {{ partner.list.length }}
          </span>
        </DevOnly>
      </div>
    </div>

    <div class="mt-10 flex flex-wrap items-center justify-center gap-2.5">
      <NuxtLink
        :to="localePath('/sponsorship-registration')"
        class="bg-muted hover:bg-border text-foreground flex items-center justify-center rounded-lg border border-transparent px-4 py-2 font-semibold tracking-tight transition active:scale-98"
      >
        Become a Sponsor
      </NuxtLink>
      <NuxtLink
        :to="localePath('/media-partner-registration')"
        class="bg-muted hover:bg-border text-foreground flex items-center justify-center rounded-lg border border-transparent px-4 py-2 font-semibold tracking-tight transition active:scale-98"
      >
        Join as Media Partner
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
import { NuxtLink } from "#components";
const localePath = useLocalePath();
const content = computed(() => useContentStore().components.credits);

// Partners are managed in PM One and fetched per active event (the server route
// resolves active->latest and maps the API shape to this component's old shape).
const { data: partnersData } = await useFetch("/api/event/partners", {
  default: () => ({ data: [] }),
});
const partners = computed(() => partnersData.value?.data ?? []);
</script>
