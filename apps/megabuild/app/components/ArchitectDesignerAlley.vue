<template>
  <section id="architect-designer-alley">
    <div
      class="container grid grid-cols-1 items-center gap-x-12 gap-y-6 md:grid-cols-2"
    >
      <NuxtImg
        src="/img/architect-and-interior-design-alley.jpg"
        alt="Architect and Interior Design Alley at Megabuild Indonesia"
        class="bg-muted outline-inside rounded-2xl md:order-last"
        width="1440"
        height="1918"
        sizes="400px sm:800px"
        format="webp"
        loading="lazy"
      />
      <div class="flex flex-col items-start">
        <span class="text-gradient-accent font-medium tracking-tight">{{
          $t("architectAlley.subtitle")
        }}</span>

        <h2
          class="text-foreground mt-2.5 text-3xl font-semibold tracking-tighter text-balance lg:text-4xl"
          v-html="$t('architectAlley.title')"
        ></h2>

        <p
          class="mt-3 max-w-2xl text-base leading-normal tracking-tight lg:text-lg"
        >
          {{ $t("architectAlley.description") }}
        </p>

        <!-- Highlights -->
        <div class="mt-6 grid grid-cols-1 gap-y-5">
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

        <p
          class="mt-6 max-w-2xl text-base leading-normal tracking-tight lg:text-lg"
        >
          {{ $t("architectAlley.closingLine") }}
        </p>

        <NuxtLink
          :to="localePath('/book-space')"
          class="bg-primary text-primary-foreground hover:bg-primary/80 mt-6 flex items-center gap-x-1 rounded-lg px-4 py-2 font-medium tracking-tight transition active:scale-98"
        >
          {{ $t("architectAlley.ctaButton") }}
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
  {
    icon: "hugeicons:presentation-bar-chart-01",
    label: t("architectAlley.highlights[0]"),
  },
  { icon: "hugeicons:agreement-01", label: t("architectAlley.highlights[1]") },
  { icon: "hugeicons:target-02", label: t("architectAlley.highlights[2]") },
  { icon: "hugeicons:global", label: t("architectAlley.highlights[3]") },
]);
</script>
