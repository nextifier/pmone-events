<template>
  <div
    v-if="source"
    class="text-muted-foreground border-border mx-auto flex w-fit items-center gap-x-1.5 rounded-full border px-3 py-1 text-xs tracking-tight sm:text-sm"
  >
    <Icon name="lucide:history" class="size-3.5 shrink-0" />
    <span>
      {{ $t("fallbackNotice.label", "Showing data from a previous edition") }}<template
        v-if="sourceTitle"
        >: {{ sourceTitle }}</template
      >
    </span>
  </div>
</template>

<script setup>
/**
 * Subtle badge shown when a section's data was borrowed from a previous event
 * edition (the active event has none yet). `source` is the API's
 * `meta.fallback.source_event` payload; pass null to render nothing.
 */
const props = defineProps({
  source: { type: Object, default: null },
});

const sourceTitle = computed(() => props.source?.title || props.source?.edition_label || "");
</script>
