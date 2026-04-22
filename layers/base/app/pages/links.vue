<template>
  <div
    class="min-h-screen-offset flex flex-col justify-between gap-y-4 lg:pt-4"
  >
    <div></div>

    <div class="container pb-10 sm:max-w-md">
      <h1
        class="text-center text-4xl leading-[1.25] font-semibold tracking-tighter text-balance text-black sm:text-5xl sm:leading-[1.25] dark:text-white"
      >
        {{ t("pages.links.title") }}
      </h1>

      <div class="mt-3 grid grid-cols-1 gap-2.5 lg:mt-6">
        <NuxtLink
          v-for="(link, index) in visibleLinks"
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

const { t } = useI18n();
const localePath = useLocalePath();

const links = [
  {
    label: "Tickets",
    url: "/ticket",
    iconName: "hugeicons:ticket-01",
  },
  {
    label: "Brands",
    url: "/brands",
    iconName: "hugeicons:grid-view",
  },
  {
    label: "Rundown",
    url: "/rundown",
    iconName: "hugeicons:check-list",
  },
];

const { data: activeEvent } = await useFetch("/api/event/active", {
  key: "links-active-event",
});

const visibleLinks = computed(() => {
  const eguideUrl = activeEvent.value?.data?.visitor_eguide?.url;
  if (!eguideUrl) return links;
  return [
    ...links,
    {
      label: "Download Visitor E-Guide",
      url: eguideUrl,
      iconName: "hugeicons:download-01",
    },
  ];
});
</script>
