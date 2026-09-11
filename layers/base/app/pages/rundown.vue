<template>
  <!-- overflow-x-clip: a tilting rundown poster projects ~15px past its box,
       which near the viewport edge lengthens the document into a horizontal
       scrollbar. `clip` (not `hidden`) drops it without making this a scroll
       container. -->
  <section id="rundown" class="min-h-screen-offset overflow-x-clip pt-4 pb-16">
    <LazyRundown />
  </section>
</template>

<script setup>
usePageMeta("rundown");
defineOptions({
  name: "rundown",
});
</script>
