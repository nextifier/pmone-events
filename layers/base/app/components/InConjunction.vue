<template>
  <div v-if="items?.length" class="flex items-center gap-2">
    <AvatarGroup :items="avatarItems" :size="2.5" :show-tooltip="true" />

    <span class="text-primary block text-sm tracking-tight text-balance">
      {{ $t("conjunction.label") }}

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
            {{
              items.length > 2
                ? `, ${$t("conjunction.and")} `
                : ` ${$t("conjunction.and")} `
            }}
          </span>

          <span v-else>, </span>
        </span>
      </template>
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const event = useEvent();
const items = computed(() => event.inConjunction?.list ?? []);

const avatarItems = computed(() => {
  const own = {
    name: event.title,
    profile_image: event.profileImage,
  };
  const list = items.value.map((item) => ({
    name: item.name,
    profile_image: item.img,
  }));
  return [own, ...list];
});
</script>
