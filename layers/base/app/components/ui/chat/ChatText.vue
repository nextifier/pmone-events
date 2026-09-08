<script setup lang="ts">
import { linkSegments } from "./autolink";

/**
 * A human's message: plain text with its URLs made clickable.
 *
 * Not markdown. Rendering markup from someone else's message is an injection
 * surface the transcript does not need; a link is the one thing people paste
 * that is worth more as an element than as text.
 */
const props = defineProps<{ text: string }>();

const segments = computed(() => linkSegments(props.text));
</script>

<template>
  <template v-for="(part, i) in segments" :key="i">
    <a
      v-if="part.href"
      :href="part.href"
      target="_blank"
      rel="noopener noreferrer"
      class="underline underline-offset-2"
      >{{ part.text }}</a
    >
    <template v-else>{{ part.text }}</template>
  </template>
</template>
