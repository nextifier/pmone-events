<template>
  <!-- Image mode (ICC/INACON original) -->
  <div
    v-if="program.image"
    class="@container flex flex-col transition active:scale-98"
  >
    <div
      class="bg-muted border-border relative aspect-2/3 w-full overflow-hidden rounded-2xl border"
    >
      <NuxtImg
        :src="program.image"
        :alt="program.title"
        class="pointer-events-none size-full object-cover select-none"
        sizes="200px sm:400px"
        width="400"
        height="600"
        loading="lazy"
        format="webp"
      />

      <div
        class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-black/0"
      ></div>

      <div
        class="absolute inset-x-0 bottom-0 flex h-1/2 flex-col items-center justify-end px-4 pb-4 text-center text-base !leading-tight font-bold tracking-tighter text-white text-shadow-lg @[200px]:px-6 @[200px]:pb-8 @[200px]:text-2xl"
      >
        <h3 class="text-balance">{{ program.title }}</h3>
      </div>
    </div>
  </div>

  <!-- Icon mode (cafeexpo/icf/cokelatexpo/flei original) -->
  <div
    v-else-if="program.iconName"
    class="border-border flex h-full flex-col items-start overflow-hidden rounded-2xl border p-4 lg:p-6"
  >
    <span class="bg-muted flex size-12 items-center justify-center rounded-3xl">
      <Icon :name="program.iconName" class="text-accent size-6" />
    </span>

    <h3
      class="text-primary mt-4 text-2xl font-semibold tracking-tighter text-balance"
    >
      {{ program.title }}
    </h3>

    <div
      v-if="program.description"
      class="mt-2.5 pb-2 tracking-tight"
      v-html="program.description"
    ></div>
  </div>

  <!-- Text-only mode (megabuild/keramika original) -->
  <div
    v-else
    class="bg-muted/50 @container relative isolate h-full overflow-hidden rounded-xl"
  >
    <div class="relative z-10 flex flex-col gap-y-1.5 px-6 py-8">
      <h3
        v-if="program.title"
        class="text-foreground text-xl font-semibold tracking-tighter"
      >
        {{ program.title }}
      </h3>
      <p
        v-if="program.description"
        class="text-muted-foreground tracking-tight"
      >
        {{ program.description }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  program: {
    type: Object,
    required: true,
  },
  number: {
    type: Number,
  },
});
</script>
