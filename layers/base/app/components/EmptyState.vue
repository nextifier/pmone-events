<template>
  <div class="flex flex-col items-center gap-y-6 text-center">
    <div v-if="$slots.image" class="perspective-midrange">
      <div
        class="shadow-wrapper w-full max-w-80 rounded-md transition duration-300 hover:rotate-x-40 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full [&_svg]:rounded-md"
      >
        <slot name="image" />
      </div>
    </div>

    <div class="flex flex-col items-center gap-y-2">
      <component
        :is="as"
        class="text-foreground text-xl font-semibold tracking-tight text-balance"
      >
        {{ title }}
      </component>

      <p
        v-if="description"
        class="text-muted-foreground max-w-md text-sm tracking-tight text-balance sm:text-base"
      >
        {{ description }}
      </p>
    </div>

    <div
      v-if="$slots.actions"
      class="flex flex-wrap items-center justify-center gap-3"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  as: { type: String, default: "h2" },
});
</script>
