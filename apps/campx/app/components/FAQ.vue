<template>
  <section id="faq" class="container grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
    <div class="flex h-full flex-col justify-between gap-y-8">
      <div class="flex flex-col items-center text-center lg:items-start lg:text-left">
        <component :is="tag" class="section-title font-semibold">{{ content.title }}</component>
        <p class="section-description mt-3">
          Kalau pertanyaanmu belum ada di sini, chat saja. Tim kami yang jawab langsung.
        </p>
      </div>

      <div class="hidden grow rounded-2xl lg:flex">
        <FlickeringGrid
          class="relative inset-0 z-0 mask-[radial-gradient(450px_circle_at_center,white,transparent)]"
          :square-size="4"
          :grid-gap="6"
          color="var(--brand)"
          :max-opacity="0.5"
          :flicker-chance="0.1"
        />
      </div>

      <div class="hidden flex-col items-center text-center lg:flex lg:items-start lg:text-left">
        <h2 class="text-foreground text-3xl font-medium tracking-tighter text-balance sm:text-5xl">
          {{ content.contactTitle }}
        </h2>
        <nuxt-link
          to="/kontak"
          class="bg-muted border-border text-primary hover:bg-primary hover:text-primary-foreground mt-4 flex items-center gap-1.5 rounded-full border px-4 py-3 font-semibold tracking-tighter transition duration-200 active:scale-98"
        >
          <span>Hubungi kami</span>
        </nuxt-link>
      </div>
    </div>

    <div class="flex flex-col gap-y-10">
      <div v-if="list.length" class="flex w-full flex-col gap-y-3">
        <h2 class="sr-only">{{ content.title }}</h2>
        <Accordion type="single" collapsible>
          <AccordionItem v-for="item in list" :key="item.id" :value="item.id">
            <AccordionTrigger>
              <span class="text-lg font-medium tracking-tighter text-balance sm:text-xl">
                {{ item.question }}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div class="typeset typeset-cms max-w-2xl" v-html="item.answer" />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div v-else class="mt-3 text-center text-base tracking-tight sm:text-lg">
        {{ content.emptyStateDescription }}
      </div>

      <div class="flex flex-col items-center text-center lg:hidden">
        <h2 class="text-foreground text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
          {{ content.contactTitle }}
        </h2>
        <nuxt-link
          to="/kontak"
          class="bg-muted text-primary hover:bg-primary hover:text-primary-foreground mt-4 flex items-center gap-1.5 rounded-full px-4 py-3 font-semibold tracking-tighter transition duration-200 active:scale-98"
        >
          <span>Hubungi kami</span>
        </nuxt-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { faqsFor } from "~/data/faqs";
import type { Faq } from "~/data/types";

/**
 * Same two-column shape as the base layer's FAQ (heading and contact CTA on the
 * left, accordion on the right, FlickeringGrid filling the gap), but reading
 * `app/data/faqs.ts` instead of PM One: campx has no active event, so the base
 * component's `/api/event/faq` call always came back empty.
 */
const props = withDefaults(
  defineProps<{
    tag?: string;
    /** Which page's question set to show. */
    page?: Faq["showOnPages"][number];
    locationSlug?: string;
    categorySlug?: string;
    limit?: number;
  }>(),
  { tag: "h2", page: "home" },
);

const content = computed(() => useContentStore().components.faq);

const list = computed(() =>
  faqsFor(props.page, {
    locationSlug: props.locationSlug,
    categorySlug: props.categorySlug,
    limit: props.limit,
  }),
);
</script>
