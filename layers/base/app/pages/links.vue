<template>
  <div
    class="min-h-screen-offset flex flex-col justify-between gap-y-4 lg:pt-4"
  >
    <div></div>

    <div class="container pb-10 sm:max-w-md">
      <h1
        class="text-center text-4xl leading-[1.25] font-semibold tracking-tighter text-balance text-black sm:text-5xl sm:leading-[1.25] dark:text-white"
      >
        {{ content.title }}
      </h1>

      <div class="mt-3 grid grid-cols-1 gap-2.5 lg:mt-6">
        <NuxtLink
          v-for="(link, index) in content.list"
          :key="index"
          :to="link.url"
          :target="link.url.startsWith('http') ? '_blank' : ''"
          class="border-border bg-muted text-primary flex items-center justify-center gap-x-1.5 rounded-xl border p-4 text-center text-base font-medium tracking-tighter transition active:scale-98"
          v-ripple
        >
          <Icon v-if="link.iconName" :name="link.iconName" class="size-5" />
          <span>{{ link.label }}</span>
        </NuxtLink>
      </div>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
        <NuxtLink
          :to="useAppConfig().socialLinks.instagram.path"
          target="_blank"
          class="text-muted-foreground hover:text-primary flex items-center gap-x-1.5 text-sm tracking-tight transition active:scale-98"
        >
          <IconInstagram class="size-4 shrink-0" />
          <span>{{ useAppConfig().social.instagram }}</span>
        </NuxtLink>

        <NuxtLink
          :to="localePath('/')"
          class="text-muted-foreground hover:text-primary flex items-center gap-x-1.5 text-sm tracking-tight transition active:scale-98"
        >
          <IconWebsite class="size-4 shrink-0" />
          <span>{{
            useAppConfig()
              .app.url.replace(/(^\w+:|^)\/\//, "")
              .replace(/\/$/, "")
          }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
usePageMeta("links");
const localePath = useLocalePath();
const content = computed(() => useContentStore().components.links);
</script>
