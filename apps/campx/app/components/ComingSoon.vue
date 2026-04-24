<template>
  <div class="relative isolate overflow-hidden">
    <div
      class="relative z-10 mx-auto flex max-w-(--breakpoint-lg) flex-col items-center gap-y-4 px-4 py-10 text-center lg:py-16"
    >
      <h1 v-if="props.title" class="tracking-wide uppercase">
        {{ props.title }}
      </h1>

      <span
        class="3xl:text-9xl text-6xl font-extrabold tracking-tighter text-black sm:text-7xl xl:text-8xl dark:text-white"
        >Coming soon</span
      >

      <p
        v-if="props.description"
        class="max-w-xl text-base tracking-tight text-balance sm:text-lg"
      >
        {{ props.description }}
      </p>

      <nuxt-link
        to="/"
        class="hover:bg-opacity-80 dark:hover:bg-opacity-80 bg-muted text-primary mt-6 flex items-center justify-center gap-x-0.5 rounded-full p-4 text-center font-medium tracking-tight transition active:scale-98"
        v-ripple
      >
        <Icon name="lucide:arrow-left" class="size-4 shrink-0" />
        <span>Back to home</span>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  description: String,
});
</script>
