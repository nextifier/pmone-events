<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  Attachment,
  AttachmentContent,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { cn } from "@/lib/utils";

/**
 * Files that can only be named: a document, or an image whose bytes are gone.
 * Inlining a PDF is a viewer, not a thumbnail, so it stays a chip.
 */
const props = defineProps<{
  items: Array<{ name?: string | null; kind: "image" | "document" }>;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <AttachmentGroup
    v-if="items.length"
    data-slot="chat-file-chips"
    :class="cn('gap-2', props.class)"
  >
    <Attachment v-for="(file, i) in items" :key="i" size="xs" class="w-44">
      <AttachmentMedia variant="icon">
        <Icon :name="file.kind === 'image' ? 'hugeicons:image-01' : 'hugeicons:pdf-01'" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{{ file.name || "Attachment" }}</AttachmentTitle>
      </AttachmentContent>
    </Attachment>
  </AttachmentGroup>
</template>
