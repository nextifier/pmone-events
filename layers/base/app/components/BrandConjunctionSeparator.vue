<template>
  <div class="flex flex-col items-center gap-y-2.5 pt-4 pb-8 text-center">
    <NuxtImg
      v-if="img"
      :src="img"
      :alt="group.event_title"
      class="bg-muted border-border size-16 rounded-full border"
      width="32"
      height="32"
      loading="lazy"
    />
    <span
      class="text-foreground text-xl font-medium tracking-tighter text-balance sm:text-4xl"
    >
      {{
        $t("brands.conjunctionExplore", {
          eventName: group.event_title,
        })
      }}
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  group: { type: Object, required: true },
  getImg: { type: Function, required: true },
});

const img = computed(() => props.getImg(props.group.project_username));
</script>
