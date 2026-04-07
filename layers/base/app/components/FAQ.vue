<template>
  <div class="container grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
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
      <div v-if="faq?.list?.length" class="flex w-full flex-col gap-y-3">
        <Accordion type="single" collapsible>
          <AccordionItem
            v-for="(item, index) in faq.list"
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
  </div>
</template>

<script setup>
const props = defineProps({
  tag: { type: String, default: "h1" },
});

const localePath = useLocalePath();
const content = computed(() => useContentStore().components.faq);
const faq = useFAQStore();
</script>
