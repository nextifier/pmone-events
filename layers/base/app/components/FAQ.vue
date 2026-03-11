<template>
  <div class="container flex flex-col items-center lg:max-w-(--breakpoint-sm)">
    <component :is="tag" class="section-title text-center font-semibold">{{ content.title }}</component>
    <p class="section-description mt-3 text-center">
      {{ content.description }}
    </p>

    <div v-if="faq?.list?.length" class="mt-6 flex w-full flex-col gap-y-3">
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

    <div class="mt-10 lg:mt-16">
      <h2
        class="text-center text-3xl font-semibold tracking-tight text-balance text-black sm:text-4xl dark:text-white"
      >
        {{ content.contactTitle }}
      </h2>
      <div class="mt-4 flex items-center justify-center lg:mt-6">
        <nuxt-link
          :to="localePath('/contact')"
          class="bg-muted text-primary hover:bg-primary hover:text-primary-foreground flex items-center gap-1.5 rounded-full p-4 font-semibold tracking-tighter transition duration-200 active:scale-98"
        >
          <span>{{ $t('ui.contactUs') }}</span>
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
