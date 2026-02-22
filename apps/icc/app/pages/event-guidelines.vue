<template>
  <div class="py-10 lg:py-16">
    <div class="container flex flex-col items-center">
      <h1 class="section-title max-w-4xl text-center font-semibold">
        {{ content.title }}
      </h1>

      <div class="mt-10 flex w-full max-w-xl flex-col gap-y-10 lg:mt-14">
        <div
          v-for="(guideline, index) in content.list"
          :key="index"
          class="flex w-full items-start gap-x-4 sm:gap-x-6"
        >
          <div class="flex-shrink-0 text-black dark:text-white">
            <NuxtImg
              :src="`/img/guidelines/${guideline.img}`"
              :alt="guideline.title"
              class="pointer-events-none aspect-square w-16 object-cover sm:w-20"
              width="80"
              height="80"
              loading="lazy"
            />
          </div>
          <div class="flex flex-col gap-y-1.5">
            <div
              class="text-base font-bold text-black uppercase sm:text-lg dark:text-white"
            >
              {{ guideline.title }}
            </div>
            <p>{{ guideline.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
usePageMeta("eventGuidelines");
const content = useContentStore().components.eventGuidelines;
</script>
