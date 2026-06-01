<template>
  <div
    class="flex"
    :class="{
      'flex-row gap-x-2': orientation === 'horizontal',
      'flex-col gap-y-2': orientation === 'vertical',
    }"
  >
    <button
      v-for="(item, index) in accentColorOptions"
      @click="accentColor = item"
      :key="index"
      :aria-label="`Select ${item.name} accent color`"
      class="flex items-center justify-center rounded-full transition"
      :class="{
        '': item?.name === accentColor?.name,
        'ring-offset-background size-5 ring-offset-2':
          orientation === 'horizontal',
        'size-5': orientation === 'vertical',
      }"
      :style="`background: ${item.background}`"
    >
      <span
        v-if="item?.name === accentColor?.name"
        class="size-1 rounded-full"
        :style="`background: ${item.foreground}`"
      ></span>
    </button>
  </div>
</template>

<script setup>
const accentColorOptions = useAppConfig().theme.accentColorOptions;
const accentColor = useCookie("accentColor");

const props = defineProps({
  orientation: {
    type: String,
    default: "horizontal",
  },
});
</script>
