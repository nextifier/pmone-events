<template>
  <div
    class="bg-muted/50 @container relative isolate h-full overflow-hidden rounded-xl"
  >
    <div class="relative z-10 flex flex-col gap-y-1.5 px-6 py-8">
      <h6
        v-if="program.title"
        class="text-foreground text-xl font-semibold tracking-tighter"
      >
        {{ program.title }}
      </h6>
      <p
        v-if="program.description"
        class="text-muted-foreground tracking-tight"
      >
        {{ program.description }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  program: {
    type: Object,
    required: true,
  },
  number: {
    type: Number,
  },
});
</script>
