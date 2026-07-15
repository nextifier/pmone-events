<template>
  <section
    id="faq"
    class="container grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2"
  >
    <div class="flex h-full flex-col justify-between gap-y-8">
      <div
        class="flex flex-col items-center text-center lg:items-start lg:text-left"
      >
        <component :is="tag" class="section-title font-semibold">{{
          content.title
        }}</component>
        <p class="section-description mt-3">
          {{ content.description }}
        </p>
        <FallbackNotice
          v-if="fallbackSource"
          :source="fallbackSource"
          class="mt-4 lg:mx-0"
        />
      </div>

      <div class="hidden grow rounded-2xl lg:flex">
        <FlickeringGrid
          class="relative inset-0 z-0 mask-[radial-gradient(450px_circle_at_center,white,transparent)]"
          :square-size="4"
          :grid-gap="6"
          color="var(--color-accent)"
          :max-opacity="0.5"
          :flicker-chance="0.1"
        />
      </div>

      <div
        class="hidden flex-col items-center text-center lg:flex lg:items-start lg:text-left"
      >
        <h2
          class="text-foreground text-3xl font-medium tracking-tighter text-balance sm:text-5xl"
        >
          {{ content.contactTitle }}
        </h2>
        <nuxt-link
          :to="localePath('/contact')"
          class="bg-muted border-border text-primary hover:bg-primary hover:text-primary-foreground mt-4 flex items-center gap-1.5 rounded-full border px-4 py-3 font-semibold tracking-tighter transition duration-200 active:scale-98"
        >
          <span>{{ $t("ui.contactUs") }}</span>
        </nuxt-link>
      </div>
    </div>

    <div class="flex flex-col gap-y-10">
      <div v-if="list.length" class="flex w-full flex-col gap-y-3">
        <h2 class="sr-only">{{ content.title }}</h2>
        <Accordion type="single" collapsible>
          <AccordionItem
            v-for="(item, index) in list"
            :key="index"
            :value="`faq-item-${index}`"
          >
            <AccordionTrigger>
              <span
                class="text-lg font-medium tracking-tighter text-balance sm:text-xl"
              >
                {{ item.q }}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div class="format-html" v-html="item.a"></div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div v-else class="mt-3 text-center text-base tracking-tight sm:text-lg">
        {{ content.emptyStateDescription }}
      </div>

      <div
        class="flex flex-col items-center text-center lg:hidden lg:items-start lg:text-left"
      >
        <h2
          class="text-foreground text-3xl font-semibold tracking-tighter text-balance sm:text-4xl"
        >
          {{ content.contactTitle }}
        </h2>
        <nuxt-link
          :to="localePath('/contact')"
          class="bg-muted text-primary hover:bg-primary hover:text-primary-foreground mt-4 flex items-center gap-1.5 rounded-full px-4 py-3 font-semibold tracking-tighter transition duration-200 active:scale-98"
        >
          <span>{{ $t("ui.contactUs") }}</span>
        </nuxt-link>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  // Defaults to h2: the common case is an embedded home-page section sitting
  // under the Hero's h1. The dedicated /faq page passes tag="h1" explicitly.
  tag: { type: String, default: "h2" },
});

const localePath = useLocalePath();
const { locale } = useI18n();
const content = computed(() => useContentStore().components.faq);

// FAQ items are managed in PM One and fetched per active event + locale, with
// {{tokens}} resolved server-side from the event/project context. The section
// heading (title/description/contactTitle) still comes from i18n.
const { data: faqData } = await useFetch("/api/event/faq", {
  query: { locale },
  watch: [locale],
  default: () => ({ data: [] }),
});

const list = computed(() => faqData.value?.data ?? []);

// Source edition when the FAQ entries were borrowed from a previous event.
const fallbackSource = computed(() => {
  const fb = faqData.value?.meta?.fallback;
  return fb?.is_fallback ? fb.source_event : null;
});

// FAQPage structured data (Google Rich Results), sourced from the same API list
// so it always matches what is displayed.
function stripHtml(html) {
  return String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() => {
        if (!list.value.length) return "{}";
        return JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: list.value.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: stripHtml(item.a),
            },
          })),
        });
      }),
    },
  ],
});
</script>
