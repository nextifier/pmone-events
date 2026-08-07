<template>
  <section v-if="partners.length" id="credits">
    <h2 class="section-title">Meet the Community Behind the Event</h2>
    <p class="mt-3 text-base tracking-tight text-pretty sm:text-lg">
      This event is brought to life by the amazing support of our partners,
      members, and stakeholders.
    </p>

    <div class="mt-10 flex w-full flex-wrap gap-x-2 gap-y-8">
      <div
        v-for="(partner, index) in partners"
        :key="index"
        class="bg-pattern-diagonal border-border relative flex grow flex-col items-center justify-center gap-y-4 rounded-xl border py-4 [--pattern-fg:var(--color-primary)]/3 sm:px-6 sm:py-6 dark:[--pattern-fg:var(--color-primary)]/10"
        :class="{
          'w-full': partner.fullWidth,
        }"
      >
        <span
          class="text-foreground bg-background xs:text-sm absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-center text-xs font-semibold tracking-tighter text-nowrap"
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
            aria-label="Partner logo"
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
  </section>
</template>

<script setup>
import { NuxtLink } from "#components";
const content = useContentStore().components.credits;
const route = useRoute();

// Client-only off the /partners page: iicc renders Credits on its prerendered
// home, and partners change often enough that a build-time snapshot goes stale.
// The `v-if="partners.length"` above keeps the section out of the DOM until the
// fetch lands. See layers/base/app/components/Credits.vue.
const isPartnersPage =
  (route.name?.toString() ?? "").split("___")[0] === "partners";

const { data: partnersData } = await useFetch("/api/event/partners", {
  key: "event-partners",
  server: isPartnersPage,
  lazy: !isPartnersPage,
  default: () => ({ data: [] }),
});
const partners = computed(() => partnersData.value?.data ?? []);
</script>
