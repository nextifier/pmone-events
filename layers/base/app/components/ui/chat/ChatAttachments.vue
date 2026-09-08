<script setup lang="ts">
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";

const props = defineProps<{
  files: File[];
  /** Locks the remove button while the turn is in flight. */
  disabled?: boolean;
}>();

const emit = defineEmits<{
  remove: [index: number];
}>();

/**
 * Object URLs for the image previews.
 *
 * Revoked whenever the list changes and again on unmount: a preview that is
 * never revoked keeps the whole file in memory for the life of the tab, and a
 * chat is exactly where someone attaches a dozen screenshots in a row.
 */
const previews = ref<Record<string, string>>({});

/**
 * Identity, not position. Keyed by index, removing the first file changed
 * every key after it, so each remaining preview was revoked and rebuilt and
 * the strip flickered. A collision - the same file queued twice by a host that
 * allows it - falls back to the position so no two cards share a key.
 */
function keyFor(file: File, index: number) {
  const key = `${file.name}:${file.size}:${file.lastModified}`;
  const first = props.files.findIndex((other) => other !== file && sameKey(other, key));

  return first !== -1 && first < index ? `${key}:${index}` : key;
}

function sameKey(file: File, key: string) {
  return `${file.name}:${file.size}:${file.lastModified}` === key;
}

function releasePreviews() {
  for (const url of Object.values(previews.value)) URL.revokeObjectURL(url);
  previews.value = {};
}

watch(
  () => props.files,
  (files) => {
    releasePreviews();

    const next: Record<string, string> = {};
    files.forEach((file, index) => {
      if (file.type.startsWith("image/")) next[keyFor(file, index)] = URL.createObjectURL(file);
    });
    previews.value = next;
  },
  { immediate: true, deep: true }
);

onBeforeUnmount(releasePreviews);

function iconFor(file: File) {
  if (file.type === "application/pdf") return "hugeicons:pdf-01";
  if (file.type.startsWith("image/")) return "hugeicons:image-01";
  return "hugeicons:file-01";
}

function sizeOf(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
</script>

<template>
  <AttachmentGroup v-if="files.length" data-slot="chat-attachments" class="gap-2 pb-1">
    <Attachment
      v-for="(file, index) in files"
      :key="keyFor(file, index)"
      size="sm"
      class="w-56"
    >
      <AttachmentMedia :variant="previews[keyFor(file, index)] ? 'image' : 'icon'">
        <img
          v-if="previews[keyFor(file, index)]"
          :src="previews[keyFor(file, index)]"
          :alt="file.name"
        />
        <Icon v-else :name="iconFor(file)" />
      </AttachmentMedia>

      <AttachmentContent>
        <AttachmentTitle>{{ file.name }}</AttachmentTitle>
        <AttachmentDescription>{{ sizeOf(file.size) }}</AttachmentDescription>
      </AttachmentContent>

      <AttachmentActions>
        <AttachmentAction
          :aria-label="`Remove ${file.name}`"
          :disabled="disabled"
          @click="emit('remove', index)"
        >
          <Icon name="hugeicons:cancel-01" />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  </AttachmentGroup>
</template>
