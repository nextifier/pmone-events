<template>
  <div
    class="relative flex h-full w-full flex-col items-center justify-center gap-1 overflow-hidden"
  >
    <Marquee
      v-for="(row, rowIndex) in rows"
      :key="rowIndex"
      :reverse="rowIndex % 2 === 1"
      :class="{
        '[--duration:40s]': rowIndex % 2 !== 1,
        '[--duration:30s]': rowIndex % 2 === 1,
      }"
    >
      <div
        v-for="(image, index) in row"
        :key="index"
        class="aspect-1600/1067 w-40 overflow-hidden bg-gray-100 xl:w-64 dark:bg-gray-900"
      >
        <NuxtImg
          :src="`${directory}/${image}`"
          alt=""
          class="h-full w-full object-cover select-none"
          width="1600"
          height="1067"
          sizes="320px xl:512px"
          format="webp"
          loading="lazy"
        />
      </div>
    </Marquee>
  </div>
</template>

<script setup>
const props = defineProps({
  rowsCount: {
    type: Number,
    default: 3,
  },
});

const directory = "/img/gallery/thumb";
const gallery = [
  "DSC00473.jpg",
  "DSC00609.jpg",
  "DSC01611.jpg",
  "DSC01803.jpg",
  "DSC01823.jpg",
  "DSC01886.jpg",
  "DSC01890.jpg",
  "DSC03585.jpg",
  "DSC06559.jpg",
  "DSC09729.jpg",
  "DSCF4488.jpg",
  "DSCF5934.jpg",
];

const rows = computed(() => {
  const result = Array.from({ length: props.rowsCount }, () => []);
  const baseRowSize = Math.floor(gallery.length / props.rowsCount);
  const remainder = gallery.length % props.rowsCount;

  let start = 0;
  for (let i = 0; i < props.rowsCount; i++) {
    const rowSize = baseRowSize + (i < remainder ? 1 : 0); // Add one extra item to the first 'remainder' rows
    result[i] = gallery.slice(start, start + rowSize);
    start += rowSize;
  }
  return result;
});
</script>
