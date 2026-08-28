<template>
  <div class="flex flex-col items-center gap-y-2.5 pt-4 pb-8 text-center">
    <component
      :is="href ? 'a' : 'div'"
      v-if="img"
      :href="href || undefined"
      :target="href ? '_blank' : undefined"
      :rel="href ? 'noopener noreferrer' : undefined"
      :aria-label="
        href
          ? $t('brands.conjunctionVisit', { eventName: group.event_title })
          : undefined
      "
      :title="
        href
          ? $t('brands.conjunctionVisit', { eventName: group.event_title })
          : undefined
      "
      class="focus-visible:ring-ring focus-visible:ring-offset-background block rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      :class="href && 'group'"
    >
      <img
        :src="img"
        :alt="group.event_title"
        class="bg-muted border-border size-16 rounded-full border object-contain transition-transform duration-(--avatar-dur) ease-(--avatar-ease-in) group-hover:scale-(--avatar-scale) motion-reduce:transition-none"
        width="128"
        height="128"
        loading="lazy"
        decoding="async"
      />
    </component>
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
  getUrl: { type: Function, default: null },
});

// `md` (400x400), not `sm` (200x200): the avatar renders at 64px CSS, which is
// 128px on a 2x screen and 192px on a 3x phone - `sm` was being upscaled.
const img = computed(() => props.getImg(props.group.project_username, "md"));

const href = computed(
  () => props.getUrl?.(props.group.project_username) || null,
);
</script>
