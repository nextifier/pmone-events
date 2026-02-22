<template>
  <div v-if="items?.length" class="flex items-center gap-2">
    <div class="relative isolate flex -space-x-2.5">
      <!-- <NuxtLink
        to="/"
        class="bg-muted ring-background border-border relative z-4 size-10 overflow-hidden rounded-full border ring-2 transition hover:scale-110"
        :style="{
          zIndex: items.length + 1,
        }"
      >
        <NuxtImg
          :src="useAppConfig().event.profileImage"
          :alt="useAppConfig().event.title"
          class="size-full"
          width="40"
          height="40"
          loading="lazy"
        />
      </NuxtLink> -->
      <NuxtLink
        v-for="(item, index) in items"
        :key="index"
        :to="item.url"
        :target="item.url.startsWith('http') ? '_blank' : ''"
        class="bg-muted border-border ring-background relative z-4 size-10 overflow-hidden rounded-full border ring-2 transition hover:scale-110"
        :style="{
          zIndex: items.length - index,
        }"
      >
        <NuxtImg
          :src="item.img"
          :alt="item.name"
          class="size-full"
          width="40"
          height="40"
          loading="lazy"
        />
      </NuxtLink>
    </div>

    <span class="text-primary block text-sm tracking-tight text-balance">
      {{ useAppConfig().event.inConjunction.label }}

      <template v-for="(item, index) in items" :key="item.name">
        <NuxtLink
          :to="item.url"
          :target="item.url.startsWith('http') ? '_blank' : ''"
          class="font-semibold hover:underline"
        >
          {{ item.name }}
        </NuxtLink>
        <span v-if="index < items.length - 1">
          <span v-if="index === items.length - 2">
            {{ items.length > 2 ? ", and " : " and " }}
          </span>

          <span v-else>, </span>
        </span>
      </template>
    </span>
  </div>
</template>

<script setup>
const items = [
  {
    name: "Megabuild Indonesia",
    url: "https://megabuild.co.id",
    img: "/img/avatar/megabuild.svg",
  },
  {
    name: "Keramika Indonesia",
    url: "https://keramika.co.id",
    img: "/img/avatar/keramika.svg",
  },
];
</script>
