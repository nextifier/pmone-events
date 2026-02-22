<template>
  <div
    class="3xl:scale-[1.75] relative flex h-full w-full scale-150 flex-col items-center justify-center gap-1 overflow-hidden rounded-3xl xl:rotate-[4deg]"
  >
    <Marquee
      v-for="(row, rowIndex) in rows"
      :key="rowIndex"
      :reverse="rowIndex % 2 === 1"
      class="[--duration:40s]"
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
          sizes="240px xl:400px"
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
  "MSA03901.jpg",
  "MSA03227.jpg",
  "MSA04443.jpg",
  "MSA03944.jpg",
  "MSA04485.jpg",
  "MSA03933.jpg",
  "MSA03292.jpg",
  "MSA04314.jpg",
  "MSA04876.jpg",
  "MSA04617.jpg",
  "MSA04454.jpg",
  "MSA04457.jpg",
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
