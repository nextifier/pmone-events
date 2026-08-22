<template>
  <!-- `outline-inside` is load-bearing, not decoration: flags with a white edge
       (Indonesia, Poland, Japan) dissolve into a white field without it, and the
       Indonesian flag in particular reads as a plain red block. -->
  <span
    class="bg-foreground/20 outline-inside flex aspect-3/2 h-4 overflow-hidden rounded-sm"
  >
    <img
      v-if="country"
      :src="flagUrl"
      :alt="countryName ?? ''"
      :title="countryName"
      class="size-full object-cover"
    />
  </span>
</template>

<script setup>
const props = defineProps({
  country: {
    required: true,
  },
  countryName: {
    type: String,
    required: false,
  },
});

const flagUrl = computed(() => {
  return `/flags/${props.country.toLowerCase()}.png`;
});
</script>
