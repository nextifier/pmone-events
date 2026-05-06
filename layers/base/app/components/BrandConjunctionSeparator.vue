<template>
  <div class="flex items-center gap-3 pt-4 sm:gap-4">
    <div class="border-border flex-1 border-t" />
    <div class="flex flex-col items-center gap-2 text-center">
      <NuxtImg
        v-if="img"
        :src="img"
        :alt="group.event_title"
        class="bg-muted border-border size-10 rounded-full border"
        width="32"
        height="32"
        loading="lazy"
      />
      <span
        class="text-foreground text-base font-medium tracking-tight text-balance sm:text-lg"
      >
        {{
          $t("brands.conjunctionExplore", {
            eventName: group.event_title,
          })
        }}
      </span>
    </div>
    <div class="border-border flex-1 border-t" />
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  group: { type: Object, required: true },
  getImg: { type: Function, required: true },
});

const img = computed(() => props.getImg(props.group.project_username));
</script>
